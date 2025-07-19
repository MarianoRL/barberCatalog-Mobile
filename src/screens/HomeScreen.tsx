import React from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Searchbar, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { BarberShop, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { OwnerDashboard } from './OwnerDashboard';
import { BarberDashboard } from './BarberDashboard';

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const GET_BARBERSHOPS = gql`
  query GetBarberShops {
    barberShops {
      id
      name
      description
      address
      city
      state
      avatar
      coverPhoto
      averageRating
      totalRatings
      favoriteCount
    }
  }
`;

const GET_FEATURED_BARBERS = gql`
  query GetFeaturedBarbers {
    barbers {
      id
      firstName
      lastName
      avatar
      bio
      experienceYears
      specialties
      averageRating
      totalRatings
    }
  }
`;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  
  // Role-based dashboard rendering
  if (user?.role === Role.OWNER) {
    return <OwnerDashboard />;
  }
  
  if (user?.role === Role.BARBER) {
    return <BarberDashboard />;
  }
  
  // Default customer dashboard
  const { data: barberShopsData, loading: barberShopsLoading } = useQuery(GET_BARBERSHOPS);
  const { data: barbersData, loading: barbersLoading } = useQuery(GET_FEATURED_BARBERS);

  const renderBarberShopCard = ({ item }: { item: BarberShop }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BarberShopDetail', { barberShopId: item.id })}
    >
      <Card style={styles.card}>
        <Card.Cover source={{ uri: item.coverPhoto || item.avatar || 'https://via.placeholder.com/300x200' }} />
        <Card.Content>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.city}, {item.state}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {item.averageRating?.toFixed(1) || 'N/A'}</Text>
            <Text style={styles.reviewCount}>({item.totalRatings || 0} reviews)</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderBarberCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BarberDetail', { barberId: item.id })}
    >
      <Card style={styles.barberCard}>
        <Card.Content style={styles.barberCardContent}>
          <Avatar.Image 
            size={60} 
            source={{ uri: item.avatar || 'https://via.placeholder.com/60x60' }} 
          />
          <View style={styles.barberInfo}>
            <Text style={styles.barberName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.barberSpecialty}>{item.specialties || 'Barber'}</Text>
            <Text style={styles.barberExperience}>{item.experienceYears || 0} years experience</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {item.averageRating?.toFixed(1) || 'N/A'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName || 'Guest'}!</Text>
        <Text style={styles.subtitle}>Find the perfect barber for you</Text>
      </View>

      <Searchbar
        placeholder="Search barber shops, services..."
        onIconPress={() => navigation.navigate('Search')}
        style={styles.searchBar}
        onSubmitEditing={() => navigation.navigate('Search')}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Barber Shops</Text>
          <Button mode="text" onPress={() => navigation.navigate('Explore')}>
            View All
          </Button>
        </View>
        
        <FlatList
          data={barberShopsData?.barberShops?.slice(0, 5) || []}
          renderItem={renderBarberShopCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Rated Barbers</Text>
          <Button mode="text">
            View All
          </Button>
        </View>
        
        <FlatList
          data={barbersData?.barbers?.slice(0, 5) || []}
          renderItem={renderBarberCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            icon="calendar-plus"
            onPress={() => navigation.navigate('Explore')}
            style={styles.quickActionButton}
          >
            Book Now
          </Button>
          <Button
            mode="outlined"
            icon="heart"
            onPress={() => navigation.navigate('Explore')}
            style={styles.quickActionButton}
          >
            Favorites
          </Button>
        </View>
      </View>
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
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  card: {
    width: 280,
    marginRight: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    color: '#FFA500',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666666',
  },
  barberCard: {
    width: 200,
    marginRight: 16,
    elevation: 3,
  },
  barberCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  barberName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  barberSpecialty: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  barberExperience: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
});