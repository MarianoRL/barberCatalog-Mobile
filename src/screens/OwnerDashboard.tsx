import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { Card, Text, Button, Avatar, Chip, IconButton, Divider, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, useMutation, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { BarberShop, Barber, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';

type OwnerDashboardNavigationProp = StackNavigationProp<MainStackParamList, 'HomeTabs'>;

const GET_OWNER_BARBER_SHOPS = gql`
  query GetOwnerBarberShops($ownerId: ID!) {
    getOwnerBarberShops(ownerId: $ownerId) {
      id
      name
      description
      address
      city
      phone
      avatar
      averageRating
      totalRatings
      favoriteCount
      isActive
      barbers {
        id
        firstName
        lastName
        avatar
        experienceYears
        averageRating
      }
    }
  }
`;

const GET_OWNER_APPOINTMENT_STATS = gql`
  query GetOwnerAppointmentStats($ownerId: ID!, $startDate: String, $endDate: String) {
    shopStats(ownerId: $ownerId, startDate: $startDate, endDate: $endDate) {
      totalAppointments
      completedAppointments
      totalRevenue
      averageAppointmentValue
      successRate
      activeShops
      shopStats {
        shopId
        shopName
        totalAppointments
        completedAppointments
        totalRevenue
        successRate
      }
    }
  }
`;

const ASSIGN_BARBER_TO_SHOP = gql`
  mutation AssignBarberToShop($barberId: ID!, $shopId: ID!) {
    assignBarberToShop(barberId: $barberId, shopId: $shopId) {
      id
      firstName
      lastName
    }
  }
`;

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<OwnerDashboardNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('THIS_MONTH');

  const { data: shopsData, loading: shopsLoading, refetch: refetchShops } = useQuery(GET_OWNER_BARBER_SHOPS, {
    variables: { ownerId: user?.id },
    skip: !user?.id,
  });

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useQuery(GET_OWNER_APPOINTMENT_STATS, {
    variables: { 
      ownerId: user?.id,
      startDate: getStartDate(timeRange),
      endDate: new Date().toISOString(),
    },
    skip: !user?.id,
  });

  const [assignBarberToShop] = useMutation(ASSIGN_BARBER_TO_SHOP, {
    onCompleted: () => {
      refetchShops();
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchShops(), refetchStats()]);
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

  const renderShopCard = ({ item }: { item: BarberShop }) => (
    <Card style={styles.shopCard}>
      <Card.Content>
        <View style={styles.shopHeader}>
          <Avatar.Image
            size={50}
            source={item.avatar ? { uri: item.avatar } : undefined}
          />
          {!item.avatar && (
            <Avatar.Text
              size={50}
              label={item.name.charAt(0).toUpperCase()}
            />
          )}
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{item.name}</Text>
            <Text style={styles.shopAddress}>{item.address}, {item.city}</Text>
            <View style={styles.shopRating}>
              <Text style={styles.ratingText}>★ {item.averageRating?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.ratingCount}>({item.totalRatings || 0})</Text>
              <Text style={styles.favoriteCount}>❤️ {item.favoriteCount || 0}</Text>
            </View>
          </View>
          <View style={styles.shopActions}>
            <Chip
              icon={item.isActive ? 'check-circle' : 'cancel'}
              style={[styles.statusChip, { backgroundColor: item.isActive ? '#4CAF50' : '#F44336' }]}
              textStyle={styles.statusChipText}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Chip>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.shopStats}>
          <View style={styles.shopStatItem}>
            <Text style={styles.shopStatLabel}>Barbers</Text>
            <Text style={styles.shopStatValue}>{item.barbers?.length || 0}</Text>
          </View>
          <View style={styles.shopStatItem}>
            <Text style={styles.shopStatLabel}>Phone</Text>
            <Text style={styles.shopStatValue}>{item.phone || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.shopButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('BarberShopDetail', { barberShopId: item.id })}
            style={styles.shopButton}
          >
            View Details
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('OwnerAnalytics', { shopId: item.id })}
            style={styles.shopButton}
          >
            Analytics
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const shops = shopsData?.getOwnerBarberShops || [];
  const stats = statsData?.shopStats;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Owner Dashboard</Text>
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

      {/* Overview Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Total Shops', shops.length, 'Active shops', 'store', '#6200EE')}
            {renderStatCard('Total Appointments', stats?.totalAppointments || 0, 'All time', 'calendar', '#03DAC6')}
            {renderStatCard('Total Revenue', `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, 'This period', 'currency-usd', '#FF6B6B')}
            {renderStatCard('Success Rate', `${stats?.successRate?.toFixed(1) || '0'}%`, 'Completed', 'check-circle', '#4CAF50')}
          </View>
        </Card.Content>
      </Card>

      {/* Detailed Analytics */}
      {stats && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Completed Appointments</Text>
                <Text style={styles.metricValue}>{stats.completedAppointments}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Avg. Appointment Value</Text>
                <Text style={styles.metricValue}>${stats.averageAppointmentValue?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Active Shops</Text>
                <Text style={styles.metricValue}>{stats.activeShops}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Shops List */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Your Barber Shops</Text>
          {shopsLoading ? (
            <Text style={styles.loadingText}>Loading shops...</Text>
          ) : shops.length > 0 ? (
            <FlatList
              data={shops}
              renderItem={renderShopCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noDataText}>No shops found. Create your first shop to get started!</Text>
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
              onPress={() => navigation.navigate('OwnerAppointments')}
              style={styles.quickActionButton}
              icon="calendar"
            >
              Manage Appointments
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('OwnerAnalytics')}
              style={styles.quickActionButton}
              icon="chart-line"
            >
              View Analytics
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Add Shop FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddBarberShop')}
        label="Add Shop"
      />
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
  shopCard: {
    marginBottom: 12,
    elevation: 2,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopInfo: {
    flex: 1,
    marginLeft: 12,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  shopAddress: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFA500',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666666',
    marginRight: 8,
  },
  favoriteCount: {
    fontSize: 12,
    color: '#666666',
  },
  shopActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 8,
  },
  statusChipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
  },
  shopStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shopStatItem: {
    alignItems: 'center',
  },
  shopStatLabel: {
    fontSize: 12,
    color: '#666666',
  },
  shopStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 2,
  },
  shopButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
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