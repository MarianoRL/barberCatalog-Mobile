import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList } from 'react-native';
import { Card, Text, Button, TextInput, Chip, IconButton, Divider, Avatar } from 'react-native-paper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, useMutation, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { BookingStatus, CreateBookingInput, TimeSlot, SelectedService, BookingCart } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { generateTimeSlots, generateDefaultTimeSlots } from '../utils/timeSlots';

type BookingScreenRouteProp = RouteProp<MainStackParamList, 'Booking'>;
type BookingScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Booking'>;

interface Props {
  route: BookingScreenRouteProp;
  navigation: BookingScreenNavigationProp;
}

const GET_SHOP_SERVICES = gql`
  query GetShopServices($shopId: ID!) {
    barberShop(id: $shopId) {
      id
      name
      services {
        id
        name
        description
        price
        durationMinutes
        category {
          id
          name
          icon
        }
        barber {
          id
          firstName
          lastName
          avatar
        }
      }
      barbers {
        id
        firstName
        lastName
        avatar
        bio
        experienceYears
        specialties
        averageRating
      }
    }
    managementServicesByShop(shopId: $shopId) {
      id
      name
      description
      price
      durationMinutes
      category {
        id
        name
        icon
      }
      barber {
        id
        firstName
        lastName
        avatar
      }
    }
  }
`;

const GET_WORKING_HOURS = gql`
  query GetWorkingHours($barberId: ID!) {
    workingHours(ownerId: $barberId, ownerType: BARBER) {
      id
      dayOfWeek
      startTime
      endTime
      isActive
    }
  }
`;

const GET_EXISTING_BOOKINGS = gql`
  query GetExistingBookings($barberId: ID!) {
    bookingsByBarber(barberId: $barberId) {
      id
      startTime
      endTime
      status
      managementService {
        durationMinutes
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

export const EnhancedBookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barberId, serviceId, barberShopId } = route.params;
  const { user } = useAuth();
  
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingCart, setBookingCart] = useState<BookingCart>({
    services: [],
    totalPrice: 0,
    totalDuration: 0,
    barberId: barberId || undefined,
    barberShopId: barberShopId || '',
  });
  const [notes, setNotes] = useState('');
  const [bookingMode, setBookingMode] = useState<'barber' | 'shop'>(barberId ? 'barber' : 'shop');
  const [selectedBarber, setSelectedBarber] = useState<string | null>(barberId || null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);

  // Get shop services and barbers
  const { data: shopData, loading: shopLoading } = useQuery(GET_SHOP_SERVICES, {
    variables: { shopId: barberShopId },
    skip: !barberShopId,
  });

  // Get working hours
  const { data: workingHoursData, loading: workingHoursLoading } = useQuery(GET_WORKING_HOURS, {
    variables: { 
      barberId: selectedBarber,
    },
    skip: !selectedBarber,
  });

  // Get existing bookings to check conflicts
  const { data: bookingsData } = useQuery(GET_EXISTING_BOOKINGS, {
    variables: {
      barberId: selectedBarber,
    },
    skip: !selectedBarber,
  });

  const [createBooking, { loading: bookingLoading }] = useMutation(CREATE_BOOKING, {
    onCompleted: (data) => {
      Alert.alert(
        'Booking Confirmed!',
        `Your appointment has been booked for ${new Date(data.createBooking.startTime).toLocaleString()}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Booking Failed', error.message);
    },
  });

  // Generate time slots based on working hours and existing bookings
  useEffect(() => {
    if (workingHoursData?.workingHours && bookingCart.totalDuration > 0) {
      // Filter working hours for the selected date
      const selectedDayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const dayWorkingHours = workingHoursData.workingHours.filter(
        (wh: any) => wh.dayOfWeek === selectedDayName
      );
      
      const slots = generateTimeSlots(
        dayWorkingHours,
        bookingsData?.bookingsByBarber || [],
        selectedDate,
        bookingCart.totalDuration
      );
      setAvailableTimeSlots(slots);
    } else if (bookingCart.totalDuration > 0) {
      // Use default time slots if no working hours available
      const slots = generateDefaultTimeSlots(selectedDate, bookingCart.totalDuration);
      setAvailableTimeSlots(slots);
    }
  }, [workingHoursData, bookingsData, selectedDate, bookingCart.totalDuration]);


  const addServiceToCart = (service: any) => {
    console.log('Adding service to cart:', service);
    
    try {
      const selectedService: SelectedService = {
        id: service.id,
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
        category: service.category
      };

      setBookingCart(prev => {
        const newCart = {
          ...prev,
          services: [...prev.services, selectedService],
          totalPrice: prev.totalPrice + service.price,
          totalDuration: prev.totalDuration + service.durationMinutes
        };
        console.log('Updated cart:', newCart);
        return newCart;
      });
      
      // Optional: Show subtle feedback without blocking popup
      // Alert.alert('Service Added', `${service.name} has been added to your booking.`);
    } catch (error) {
      console.error('Error adding service to cart:', error);
      Alert.alert('Error', 'Failed to add service to cart.');
    }
  };

  const removeServiceFromCart = (serviceId: string) => {
    setBookingCart(prev => {
      const serviceToRemove = prev.services.find(s => s.id === serviceId);
      if (!serviceToRemove) return prev;

      return {
        ...prev,
        services: prev.services.filter(s => s.id !== serviceId),
        totalPrice: prev.totalPrice - serviceToRemove.price,
        totalDuration: prev.totalDuration - serviceToRemove.durationMinutes
      };
    });
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    
    if (newDate >= new Date()) {
      setSelectedDate(newDate);
      setSelectedTimeSlot(null);
    }
  };

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.isAvailable) {
      setSelectedTimeSlot(timeSlot);
    }
  };

  const handleBookingModeChange = (mode: 'barber' | 'shop') => {
    setBookingMode(mode);
    setSelectedBarber(mode === 'barber' ? (barberId || null) : null);
    setBookingCart(prev => ({
      ...prev,
      barberId: mode === 'barber' ? (barberId || undefined) : undefined
    }));
  };

  const handleCreateBooking = async () => {
    if (!user || bookingCart.services.length === 0 || !selectedTimeSlot) {
      Alert.alert('Error', 'Please select services and a time slot');
      return;
    }

    if (bookingMode === 'barber' && !selectedBarber) {
      Alert.alert('Error', 'Please select a barber');
      return;
    }

    // Create multiple bookings if multiple services selected
    try {
      for (const service of bookingCart.services) {
        const startDateTime = new Date(selectedDate);
        const [hours, minutes] = selectedTimeSlot.startTime.split(':').map(Number);
        startDateTime.setHours(hours, minutes, 0, 0);

        const input: CreateBookingInput = {
          userId: user.id,
          barberId: selectedBarber || shopData?.barberShop?.barbers?.[0]?.id || '',
          barberShopId: bookingCart.barberShopId,
          managementServiceId: service.id,
          startTime: startDateTime.toISOString(),
          notes: notes || undefined,
        };

        await createBooking({ variables: { input } });
        
        // Add service duration to next booking start time
        startDateTime.setMinutes(startDateTime.getMinutes() + service.durationMinutes);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const renderServiceItem = ({ item }: { item: any }) => {
    console.log('Rendering service item:', item);
    
    return (
      <Card style={styles.serviceItem}>
        <Card.Content>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceCategory}>{item.category?.name || 'General'}</Text>
              <Text style={styles.servicePrice}>${item.price}</Text>
              <Text style={styles.serviceDuration}>{item.durationMinutes} min</Text>
              {item.barber && (
                <Text style={styles.serviceBarber}>
                  with {item.barber.firstName} {item.barber.lastName}
                </Text>
              )}
            </View>
            <View style={styles.serviceActions}>
              <IconButton
                icon="plus"
                size={24}
                onPress={() => {
                  console.log('Service add button pressed for:', item.name);
                  addServiceToCart(item);
                }}
                style={styles.addButton}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderCartItem = ({ item }: { item: SelectedService }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>${item.price}</Text>
      </View>
      <IconButton
        icon="close"
        size={20}
        onPress={() => removeServiceFromCart(item.id)}
      />
    </View>
  );

  const renderBarberItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.barberItem,
        selectedBarber === item.id && styles.selectedBarberItem
      ]}
      onPress={() => setSelectedBarber(item.id)}
    >
      <Avatar.Image
        size={50}
        source={{ uri: item.avatar || 'https://via.placeholder.com/50x50' }}
      />
      <View style={styles.barberInfo}>
        <Text style={styles.barberName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.barberSpecialty}>{item.specialties}</Text>
        <Text style={styles.barberRating}>★ {item.averageRating?.toFixed(1) || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTimeSlot = ({ item }: { item: TimeSlot }) => (
    <Chip
      selected={selectedTimeSlot?.startTime === item.startTime}
      onPress={() => handleTimeSlotSelect(item)}
      style={[
        styles.timeSlot,
        !item.isAvailable && styles.unavailableSlot,
        selectedTimeSlot?.startTime === item.startTime && styles.selectedTimeSlot
      ]}
      disabled={!item.isAvailable}
      textStyle={[
        styles.timeSlotText,
        !item.isAvailable && styles.unavailableSlotText
      ]}
    >
      {item.startTime} - {item.endTime}
    </Chip>
  );

  if (shopLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Book Appointment</Text>
          <Text style={styles.shopName}>{shopData?.barberShop?.name}</Text>
        </Card.Content>
      </Card>

      {/* Booking Mode Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Booking Type</Text>
          <View style={styles.modeButtons}>
            <Button
              mode={bookingMode === 'barber' ? 'contained' : 'outlined'}
              onPress={() => handleBookingModeChange('barber')}
              style={styles.modeButton}
            >
              Specific Barber
            </Button>
            <Button
              mode={bookingMode === 'shop' ? 'contained' : 'outlined'}
              onPress={() => handleBookingModeChange('shop')}
              style={styles.modeButton}
            >
              Any Available
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Barber Selection */}
      {bookingMode === 'barber' && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Select Barber</Text>
            <FlatList
              data={shopData?.barberShop?.barbers || []}
              renderItem={renderBarberItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.barberList}
            />
          </Card.Content>
        </Card>
      )}

      {/* Service Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Select Services</Text>
          {console.log('Shop data:', shopData)}
          {console.log('Services from barberShop:', shopData?.barberShop?.services?.length || 0)}
          {console.log('Services from managementServicesByShop:', shopData?.managementServicesByShop?.length || 0)}
          
          {(() => {
            // Use services from managementServicesByShop first, then fallback to barberShop.services
            const services = shopData?.managementServicesByShop?.length > 0 
              ? shopData.managementServicesByShop 
              : shopData?.barberShop?.services || [];
            
            console.log('Using services:', services);
            
            return services.length > 0 ? (
              <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noServicesText}>
                {shopLoading ? 'Loading services...' : 'No services available'}
              </Text>
            );
          })()}
        </Card.Content>
      </Card>

      {/* Shopping Cart */}
      {bookingCart.services.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Selected Services</Text>
            <FlatList
              data={bookingCart.services}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
            <Divider style={styles.divider} />
            <View style={styles.cartSummary}>
              <Text style={styles.cartTotal}>Total: ${bookingCart.totalPrice}</Text>
              <Text style={styles.cartDuration}>Duration: {bookingCart.totalDuration} min</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Date Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.dateContainer}>
            <IconButton
              icon="chevron-left"
              onPress={() => handleDateChange('prev')}
              disabled={selectedDate <= new Date()}
            />
            <Text style={styles.selectedDate}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <IconButton
              icon="chevron-right"
              onPress={() => handleDateChange('next')}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Time Slots */}
      {bookingCart.services.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Available Time Slots</Text>
            {workingHoursLoading ? (
              <Text style={styles.loadingText}>Loading available times...</Text>
            ) : (
              <FlatList
                data={availableTimeSlots}
                renderItem={renderTimeSlot}
                keyExtractor={(item, index) => `${item.startTime}-${index}`}
                numColumns={2}
                scrollEnabled={false}
                style={styles.timeSlotsContainer}
              />
            )}
          </Card.Content>
        </Card>
      )}

      {/* Notes */}
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
            placeholder="Any special requests or notes..."
          />
        </Card.Content>
      </Card>

      {/* Booking Summary and Confirm */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Services:</Text>
            <Text style={styles.summaryValue}>{bookingCart.services.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Duration:</Text>
            <Text style={styles.summaryValue}>{bookingCart.totalDuration} minutes</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Price:</Text>
            <Text style={styles.summaryPrice}>${bookingCart.totalPrice}</Text>
          </View>
          {selectedTimeSlot && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>
                {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Confirm Button */}
      <View style={styles.confirmContainer}>
        <Button
          mode="contained"
          onPress={handleCreateBooking}
          loading={bookingLoading}
          disabled={
            bookingCart.services.length === 0 || 
            !selectedTimeSlot || 
            bookingLoading ||
            (bookingMode === 'barber' && !selectedBarber)
          }
          style={styles.confirmButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 18,
    color: '#6200EE',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
  },
  barberList: {
    maxHeight: 120,
  },
  barberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 200,
  },
  selectedBarberItem: {
    borderColor: '#6200EE',
    backgroundColor: '#f3e5f5',
  },
  barberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  barberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  barberSpecialty: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  barberRating: {
    fontSize: 14,
    color: '#FFA500',
    marginTop: 2,
  },
  serviceItem: {
    marginBottom: 12,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceCategory: {
    fontSize: 14,
    color: '#6200EE',
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  serviceBarber: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  serviceActions: {
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#6200EE',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#4CAF50',
  },
  divider: {
    marginVertical: 12,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cartDuration: {
    fontSize: 16,
    color: '#666666',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  timeSlotsContainer: {
    maxHeight: 200,
  },
  timeSlot: {
    margin: 4,
    flex: 1,
  },
  selectedTimeSlot: {
    backgroundColor: '#6200EE',
  },
  unavailableSlot: {
    opacity: 0.5,
    backgroundColor: '#ffcccb',
  },
  timeSlotText: {
    fontSize: 12,
  },
  unavailableSlotText: {
    color: '#666666',
  },
  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666666',
  },
  noServicesText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666666',
    padding: 20,
  },
  notesInput: {
    backgroundColor: '#ffffff',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  confirmContainer: {
    padding: 16,
  },
  confirmButton: {
    paddingVertical: 12,
  },
});