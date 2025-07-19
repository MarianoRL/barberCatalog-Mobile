import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Text, Button, TextInput, Chip } from 'react-native-paper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, useMutation, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { BookingStatus, CreateBookingInput, TimeSlot } from '../types';
import { useAuth } from '../contexts/AuthContext';

type BookingScreenRouteProp = RouteProp<MainStackParamList, 'Booking'>;
type BookingScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Booking'>;

interface Props {
  route: BookingScreenRouteProp;
  navigation: BookingScreenNavigationProp;
}

const GET_BARBER_AVAILABILITY = gql`
  query GetBarberAvailability($barberId: ID!, $date: String!) {
    barberAvailability(barberId: $barberId, date: $date) {
      startTime
      endTime
      isAvailable
    }
  }
`;

const GET_BARBER_SERVICES = gql`
  query GetBarberServices($barberId: ID!) {
    managementServicesByBarber(barberId: $barberId) {
      id
      name
      description
      price
      durationMinutes
      category {
        id
        name
      }
      barberShop {
        id
        name
        address
        city
        state
      }
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      startTime
      endTime
      status
      totalPrice
      notes
      barber {
        id
        firstName
        lastName
      }
      barberShop {
        id
        name
      }
      managementService {
        id
        name
      }
    }
  }
`;

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barberId, serviceId } = route.params;
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || '');
  const [notes, setNotes] = useState('');

  const { data: availabilityData, loading: availabilityLoading } = useQuery(GET_BARBER_AVAILABILITY, {
    variables: { 
      barberId, 
      date: selectedDate.toISOString().split('T')[0] 
    },
  });

  const { data: servicesData, loading: servicesLoading } = useQuery(GET_BARBER_SERVICES, {
    variables: { barberId },
  });

  const [createBooking, { loading: bookingLoading }] = useMutation(CREATE_BOOKING, {
    onCompleted: (data) => {
      Alert.alert(
        'Booking Confirmed!',
        `Your appointment has been booked for ${new Date(data.createBooking.startTime).toLocaleString()}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('BookingsScreen'),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Booking Failed', error.message);
    },
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.isAvailable) {
      setSelectedTimeSlot(timeSlot);
    }
  };

  const handleCreateBooking = async () => {
    if (!user || !selectedServiceId || !selectedTimeSlot) {
      Alert.alert('Error', 'Please select a service and time slot');
      return;
    }

    const selectedService = servicesData?.managementServicesByBarber?.find(
      (service: any) => service.id === selectedServiceId
    );

    if (!selectedService) {
      Alert.alert('Error', 'Selected service not found');
      return;
    }

    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTimeSlot.startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);

    const input: CreateBookingInput = {
      userId: user.id,
      barberId,
      barberShopId: selectedService.barberShop.id,
      managementServiceId: selectedServiceId,
      startTime: startDateTime.toISOString(),
      notes: notes || undefined,
    };

    try {
      await createBooking({ variables: { input } });
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const getTimeSlots = () => {
    return availabilityData?.barberAvailability || [];
  };

  const getSelectedService = () => {
    return servicesData?.managementServicesByBarber?.find(
      (service: any) => service.id === selectedServiceId
    );
  };

  const selectedService = getSelectedService();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Book Appointment</Text>
          
          {selectedService && (
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{selectedService.name}</Text>
              <Text style={styles.servicePrice}>${selectedService.price}</Text>
              <Text style={styles.serviceDuration}>{selectedService.durationMinutes} minutes</Text>
              <Text style={styles.serviceShop}>{selectedService.barberShop.name}</Text>
              <Text style={styles.serviceAddress}>
                {selectedService.barberShop.address}, {selectedService.barberShop.city}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Select Service</Text>
          <View style={styles.serviceGrid}>
            {servicesData?.managementServicesByBarber?.map((service: any) => (
              <Chip
                key={service.id}
                selected={selectedServiceId === service.id}
                onPress={() => setSelectedServiceId(service.id)}
                style={styles.serviceChip}
              >
                {service.name} - ${service.price}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Text style={styles.dateDisplay}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <View style={styles.dateButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                const yesterday = new Date(selectedDate);
                yesterday.setDate(yesterday.getDate() - 1);
                if (yesterday >= new Date()) {
                  handleDateChange(yesterday);
                }
              }}
              style={styles.dateButton}
            >
              Previous
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                const tomorrow = new Date(selectedDate);
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateChange(tomorrow);
              }}
              style={styles.dateButton}
            >
              Next
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <Text style={styles.dateDisplay}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          <View style={styles.timeSlotsContainer}>
            {getTimeSlots().map((slot: TimeSlot, index: number) => (
              <Chip
                key={index}
                selected={selectedTimeSlot?.startTime === slot.startTime}
                onPress={() => handleTimeSlotSelect(slot)}
                style={[
                  styles.timeSlot,
                  !slot.isAvailable && styles.unavailableSlot,
                ]}
                disabled={!slot.isAvailable}
              >
                {slot.startTime}
              </Chip>
            ))}
          </View>

          {getTimeSlots().length === 0 && !availabilityLoading && (
            <Text style={styles.noSlotsText}>No available time slots for this date</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
            placeholder="Any special requests or notes for your barber..."
          />
        </Card.Content>
      </Card>

      <View style={styles.bookingFooter}>
        <View style={styles.bookingDetails}>
          <Text style={styles.bookingDetailLabel}>Total Price:</Text>
          <Text style={styles.bookingDetailValue}>
            ${selectedService?.price || 0}
          </Text>
        </View>
        
        <Button
          mode="contained"
          onPress={handleCreateBooking}
          loading={bookingLoading}
          disabled={!selectedServiceId || !selectedTimeSlot || bookingLoading}
          style={styles.bookButton}
        >
          Confirm Booking
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  serviceInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  serviceShop: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 4,
  },
  serviceAddress: {
    fontSize: 14,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    marginBottom: 8,
  },
  dateDisplay: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    marginBottom: 8,
  },
  unavailableSlot: {
    opacity: 0.5,
  },
  noSlotsText: {
    textAlign: 'center',
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 16,
  },
  notesInput: {
    backgroundColor: '#ffffff',
  },
  bookingFooter: {
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 3,
    marginTop: 16,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingDetailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingDetailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bookButton: {
    paddingVertical: 8,
  },
});