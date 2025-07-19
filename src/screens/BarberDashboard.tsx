import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Avatar, Chip, IconButton, Divider, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { Rating, Booking, BookingStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Rating as RatingComponent } from '../components/Rating';

type BarberDashboardNavigationProp = StackNavigationProp<MainStackParamList, 'HomeTabs'>;

const GET_BARBER_STATS = gql`
  query GetBarberStats($barberId: ID!, $startDate: String, $endDate: String) {
    barberStats(barberId: $barberId, startDate: $startDate, endDate: $endDate) {
      totalBookings
      completedBookings
      totalRevenue
      averageRating
      successRate
      averageServicePrice
      topServices {
        serviceName
        bookingCount
        totalRevenue
      }
    }
  }
`;

const GET_BARBER_BOOKINGS = gql`
  query GetBarberBookings($barberId: ID!, $limit: Int) {
    bookingsByBarber(barberId: $barberId, limit: $limit) {
      id
      startTime
      endTime
      status
      totalPrice
      notes
      user {
        id
        firstName
        lastName
        avatar
      }
      managementService {
        id
        name
        durationMinutes
      }
      barberShop {
        id
        name
      }
    }
  }
`;

const GET_BARBER_RATINGS = gql`
  query GetBarberRatings($barberId: ID!, $limit: Int) {
    ratingsByEntity(entityId: $barberId, entityType: BARBER, limit: $limit) {
      id
      rating
      comment
      createdAt
      rater {
        id
        firstName
        lastName
        avatar
      }
      booking {
        id
        managementService {
          name
        }
      }
    }
  }
`;

const GET_UPCOMING_BOOKINGS = gql`
  query GetUpcomingBookings($barberId: ID!) {
    upcomingBookings(barberId: $barberId) {
      id
      startTime
      endTime
      status
      user {
        id
        firstName
        lastName
        avatar
        phone
      }
      managementService {
        name
        durationMinutes
      }
    }
  }
`;

export const BarberDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<BarberDashboardNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('THIS_MONTH');

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_BARBER_STATS, {
    variables: { 
      barberId: user?.id,
      startDate: getStartDate(timeRange),
      endDate: new Date().toISOString(),
    },
    skip: !user?.id,
  });

  const { data: bookingsData, loading: bookingsLoading, refetch: refetchBookings } = useQuery(GET_BARBER_BOOKINGS, {
    variables: { barberId: user?.id, limit: 10 },
    skip: !user?.id,
  });

  const { data: ratingsData, loading: ratingsLoading, refetch: refetchRatings } = useQuery(GET_BARBER_RATINGS, {
    variables: { barberId: user?.id, limit: 5 },
    skip: !user?.id,
  });

  const { data: upcomingData, loading: upcomingLoading, refetch: refetchUpcoming } = useQuery(GET_UPCOMING_BOOKINGS, {
    variables: { barberId: user?.id },
    skip: !user?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchBookings(), refetchRatings(), refetchUpcoming()]);
    setRefreshing(false);
  };

  function getStartDate(range: string): string {
    const now = new Date();
    switch (range) {
      case 'TODAY':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'THIS_WEEK':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return startOfWeek.toISOString();
      case 'THIS_MONTH':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      case 'LAST_30_DAYS':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
  }

  const renderStatCard = (title: string, value: string | number, subtitle?: string, icon?: string, color?: string) => (
    <Card style={[styles.statCard, { backgroundColor: color || '#ffffff' }]}>
      <Card.Content style={styles.statContent}>
        <View style={styles.statHeader}>
          <Text style={[styles.statTitle, { color: color ? '#ffffff' : '#666666' }]}>{title}</Text>
          {icon && <IconButton icon={icon} size={24} iconColor={color ? '#ffffff' : '#666666'} />}
        </View>
        <Text style={[styles.statValue, { color: color ? '#ffffff' : '#333333' }]}>{value}</Text>
        {subtitle && <Text style={[styles.statSubtitle, { color: color ? '#ffffff' : '#666666' }]}>{subtitle}</Text>}
      </Card.Content>
    </Card>
  );

  const renderTimeRangeChip = (range: string, label: string) => (
    <Chip
      key={range}
      selected={timeRange === range}
      onPress={() => setTimeRange(range)}
      style={[styles.timeChip, timeRange === range && styles.selectedTimeChip]}
      textStyle={timeRange === range && styles.selectedTimeChipText}
    >
      {label}
    </Chip>
  );

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const getStatusColor = (status: BookingStatus) => {
      switch (status) {
        case BookingStatus.CONFIRMED:
          return '#4CAF50';
        case BookingStatus.PENDING:
          return '#FFA500';
        case BookingStatus.COMPLETED:
          return '#2196F3';
        case BookingStatus.CANCELLED:
          return '#F44336';
        default:
          return '#666666';
      }
    };

    return (
      <Card style={styles.bookingCard}>
        <Card.Content>
          <View style={styles.bookingHeader}>
            <View style={styles.bookingCustomer}>
              <Avatar.Image
                size={40}
                source={item.user.avatar ? { uri: item.user.avatar } : undefined}
              />
              {!item.user.avatar && (
                <Avatar.Text
                  size={40}
                  label={`${item.user.firstName.charAt(0)}${item.user.lastName.charAt(0)}`}
                />
              )}
              <View style={styles.bookingInfo}>
                <Text style={styles.customerName}>{item.user.firstName} {item.user.lastName}</Text>
                <Text style={styles.serviceName}>{item.managementService.name}</Text>
                <Text style={styles.bookingTime}>
                  {new Date(item.startTime).toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.bookingStatus}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusChipText}
              >
                {item.status}
              </Chip>
              <Text style={styles.bookingPrice}>${item.totalPrice}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderRatingItem = ({ item }: { item: Rating }) => {
    const reviewer = item.rater;
    const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Anonymous';

    return (
      <Card style={styles.ratingCard}>
        <Card.Content>
          <View style={styles.ratingHeader}>
            <Avatar.Image
              size={35}
              source={reviewer?.avatar ? { uri: reviewer.avatar } : undefined}
            />
            {!reviewer?.avatar && (
              <Avatar.Text
                size={35}
                label={reviewerName.split(' ').map(n => n[0]).join('')}
              />
            )}
            <View style={styles.ratingInfo}>
              <Text style={styles.reviewerName}>{reviewerName}</Text>
              <View style={styles.ratingStars}>
                <RatingComponent rating={item.rating} size={16} disabled />
                <Text style={styles.ratingText}>{item.rating}/5</Text>
              </View>
            </View>
            <Text style={styles.ratingDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {item.comment && (
            <Text style={styles.ratingComment}>{item.comment}</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderServiceItem = ({ item }: { item: any }) => (
    <View style={styles.serviceItem}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Text style={styles.serviceStats}>
          {item.bookingCount} bookings • ${item.totalRevenue.toFixed(2)}
        </Text>
      </View>
      <View style={styles.serviceProgress}>
        <ProgressBar
          progress={item.bookingCount / (statsData?.barberStats?.totalBookings || 1)}
          color="#6200EE"
          style={styles.progressBar}
        />
      </View>
    </View>
  );

  const stats = statsData?.barberStats;
  const bookings = bookingsData?.bookingsByBarber || [];
  const ratings = ratingsData?.ratingsByEntity || [];
  const upcomingBookings = upcomingData?.upcomingBookings || [];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Barber Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.firstName}!</Text>
      </View>

      {/* Time Range Filter */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Time Range</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangeContainer}>
            {renderTimeRangeChip('TODAY', 'Today')}
            {renderTimeRangeChip('THIS_WEEK', 'This Week')}
            {renderTimeRangeChip('THIS_MONTH', 'This Month')}
            {renderTimeRangeChip('LAST_30_DAYS', 'Last 30 Days')}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Performance Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Total Bookings', stats?.totalBookings || 0, 'This period', 'calendar', '#6200EE')}
            {renderStatCard('Revenue', `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, 'Total earned', 'currency-usd', '#4CAF50')}
            {renderStatCard('Success Rate', `${stats?.successRate?.toFixed(1) || '0'}%`, 'Completed', 'check-circle', '#03DAC6')}
            {renderStatCard('Rating', stats?.averageRating?.toFixed(1) || 'N/A', 'Average rating', 'star', '#FFA500')}
          </View>
        </Card.Content>
      </Card>

      {/* Detailed Metrics */}
      {stats && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Detailed Metrics</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Completed Bookings</Text>
                <Text style={styles.metricValue}>{stats.completedBookings}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Avg. Service Price</Text>
                <Text style={styles.metricValue}>${stats.averageServicePrice?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Total Services</Text>
                <Text style={styles.metricValue}>{stats.topServices?.length || 0}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Top Services */}
      {stats?.topServices && stats.topServices.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Top Services</Text>
            <FlatList
              data={stats.topServices}
              renderItem={renderServiceItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Card.Content>
        </Card>
      )}

      {/* Upcoming Appointments */}
      {upcomingBookings.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <FlatList
              data={upcomingBookings.slice(0, 3)}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
            {upcomingBookings.length > 3 && (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Bookings')}
                style={styles.viewAllButton}
              >
                View All Appointments
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Recent Bookings */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {bookingsLoading ? (
            <Text style={styles.loadingText}>Loading bookings...</Text>
          ) : bookings.length > 0 ? (
            <FlatList
              data={bookings.slice(0, 5)}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noDataText}>No bookings found</Text>
          )}
        </Card.Content>
      </Card>

      {/* Recent Reviews */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {ratingsLoading ? (
            <Text style={styles.loadingText}>Loading reviews...</Text>
          ) : ratings.length > 0 ? (
            <FlatList
              data={ratings}
              renderItem={renderRatingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noDataText}>No reviews yet</Text>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Bookings')}
              style={styles.quickActionButton}
              icon="calendar"
            >
              View All Bookings
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Reviews', { 
                entityId: user?.id || '', 
                entityType: 'BARBER', 
                entityName: `${user?.firstName} ${user?.lastName}` 
              })}
              style={styles.quickActionButton}
              icon="star"
            >
              View Reviews
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200EE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  card: {
    margin: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  timeRangeContainer: {
    paddingVertical: 8,
  },
  timeChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedTimeChip: {
    backgroundColor: '#6200EE',
  },
  selectedTimeChipText: {
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  statContent: {
    paddingVertical: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statSubtitle: {
    fontSize: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4,
  },
  serviceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  serviceStats: {
    fontSize: 12,
    color: '#666666',
  },
  serviceProgress: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  bookingCard: {
    marginBottom: 8,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  serviceName: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  bookingTime: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  statusChipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ratingCard: {
    marginBottom: 8,
    elevation: 1,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  ratingDate: {
    fontSize: 12,
    color: '#666666',
  },
  ratingComment: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  viewAllButton: {
    marginTop: 12,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666666',
    fontStyle: 'italic',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666666',
    fontStyle: 'italic',
    padding: 20,
  },
});