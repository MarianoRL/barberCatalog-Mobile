import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, FAB, Portal, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, useMutation, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { Booking, BookingStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';

type BookingsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const GET_USER_BOOKINGS = gql`
  query GetUserBookings($userId: ID!) {
    bookingsByUser(userId: $userId) {
      id
      startTime
      endTime
      status
      totalPrice
      notes
      cancelReason
      createdAt
      barber {
        id
        firstName
        lastName
        avatar
      }
      barberShop {
        id
        name
        address
        city
        state
      }
      managementService {
        id
        name
        price
        durationMinutes
      }
    }
  }
`;

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: ID!, $status: BookingStatus!, $reason: String) {
    updateBookingStatus(id: $id, status: $status, reason: $reason) {
      id
      status
      cancelReason
    }
  }
`;

export const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GET_USER_BOOKINGS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  const [updateBookingStatus] = useMutation(UPDATE_BOOKING_STATUS, {
    onCompleted: () => {
      refetch();
      setShowCancelModal(false);
      setCancelingBookingId(null);
    },
  });

  const filteredBookings = data?.bookingsByUser?.filter((booking: Booking) => {
    return selectedStatus === 'ALL' || booking.status === selectedStatus;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return '#FFA500';
      case BookingStatus.CONFIRMED:
        return '#4CAF50';
      case BookingStatus.IN_PROGRESS:
        return '#2196F3';
      case BookingStatus.COMPLETED:
        return '#9C27B0';
      case BookingStatus.CANCELLED:
        return '#F44336';
      case BookingStatus.NO_SHOW:
        return '#757575';
      default:
        return '#757575';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleCancelBooking = async () => {
    if (!cancelingBookingId) return;

    try {
      await updateBookingStatus({
        variables: {
          id: cancelingBookingId,
          status: BookingStatus.CANCELLED,
          reason: 'Cancelled by user',
        },
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const startDateTime = formatDateTime(item.startTime);
    const canCancel = item.status === BookingStatus.PENDING || item.status === BookingStatus.CONFIRMED;

    return (
      <Card style={styles.bookingCard}>
        <Card.Content>
          <View style={styles.bookingHeader}>
            <Text style={styles.serviceName}>{item.managementService.name}</Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
              textStyle={styles.statusText}
            >
              {item.status}
            </Chip>
          </View>

          <Text style={styles.barberShopName}>{item.barberShop.name}</Text>
          <Text style={styles.barberName}>
            with {item.barber.firstName} {item.barber.lastName}
          </Text>
          <Text style={styles.address}>
            {item.barberShop.address}, {item.barberShop.city}, {item.barberShop.state}
          </Text>

          <View style={styles.bookingDetails}>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateText}>{startDateTime.date}</Text>
              <Text style={styles.timeText}>{startDateTime.time}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>${item.totalPrice}</Text>
              <Text style={styles.durationText}>
                {item.managementService.durationMinutes}min
              </Text>
            </View>
          </View>

          {item.notes && (
            <Text style={styles.notes}>Notes: {item.notes}</Text>
          )}

          {item.cancelReason && (
            <Text style={styles.cancelReason}>
              Cancelled: {item.cancelReason}
            </Text>
          )}

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('BarberShopDetail', { barberShopId: item.barberShop.id })}
              style={styles.actionButton}
            >
              View Shop
            </Button>
            
            {canCancel && (
              <Button
                mode="text"
                onPress={() => {
                  setCancelingBookingId(item.id);
                  setShowCancelModal(true);
                }}
                style={styles.actionButton}
                textColor="#F44336"
              >
                Cancel
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        
        <FlatList
          data={[
            { key: 'ALL', label: 'All' },
            { key: BookingStatus.PENDING, label: 'Pending' },
            { key: BookingStatus.CONFIRMED, label: 'Confirmed' },
            { key: BookingStatus.COMPLETED, label: 'Completed' },
            { key: BookingStatus.CANCELLED, label: 'Cancelled' },
          ]}
          renderItem={({ item }) => (
            <Chip
              selected={selectedStatus === item.key}
              onPress={() => setSelectedStatus(item.key as BookingStatus | 'ALL')}
              style={styles.filterChip}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        />
      </View>

      <FlatList
        data={filteredBookings || []}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Explore')}
              style={styles.exploreButton}
            >
              Explore Barber Shops
            </Button>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Explore')}
      />

      <Portal>
        <Modal
          visible={showCancelModal}
          onDismiss={() => setShowCancelModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Cancel Booking</Text>
          <Text style={styles.modalText}>
            Are you sure you want to cancel this booking?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowCancelModal(false)}
              style={styles.modalButton}
            >
              Keep Booking
            </Button>
            <Button
              mode="contained"
              onPress={handleCancelBooking}
              style={styles.modalButton}
              buttonColor="#F44336"
            >
              Cancel Booking
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingBottom: 16,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333333',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    marginBottom: 16,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  barberShopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 4,
  },
  barberName: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  durationText: {
    fontSize: 12,
    color: '#666666',
  },
  notes: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  cancelReason: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 16,
  },
  exploreButton: {
    marginTop: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});