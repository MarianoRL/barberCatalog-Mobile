import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Card, Text, Button, Avatar, FAB, IconButton, Chip, Divider } from 'react-native-paper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, useMutation, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { BarberShop, Barber, ManagementService, RatedType } from '../types';
import { useAuth } from '../contexts/AuthContext';

type BarberShopDetailScreenRouteProp = RouteProp<MainStackParamList, 'BarberShopDetail'>;
type BarberShopDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'BarberShopDetail'>;

interface Props {
  route: BarberShopDetailScreenRouteProp;
  navigation: BarberShopDetailScreenNavigationProp;
}

const GET_BARBERSHOP_DETAIL = gql`
  query GetBarberShopDetail($id: ID!) {
    barberShop(id: $id) {
      id
      name
      description
      address
      city
      state
      country
      zipCode
      phone
      email
      website
      avatar
      coverPhoto
      averageRating
      totalRatings
      favoriteCount
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
      }
      workingHours {
        id
        dayOfWeek
        startTime
        endTime
        isActive
      }
    }
  }
`;

const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($userId: ID!, $shopId: ID!) {
    toggleFavorite(userId: $userId, shopId: $shopId)
  }
`;

const IS_FAVORITE = gql`
  query IsFavorite($userId: ID!, $shopId: ID!) {
    isFavorite(userId: $userId, shopId: $shopId)
  }
`;

export const BarberShopDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barberShopId } = route.params;
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'barbers' | 'services' | 'hours'>('barbers');

  const { data, loading } = useQuery(GET_BARBERSHOP_DETAIL, {
    variables: { id: barberShopId },
  });

  const { data: favoriteData, refetch: refetchFavorite } = useQuery(IS_FAVORITE, {
    variables: { userId: user?.id, shopId: barberShopId },
    skip: !user?.id,
  });

  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE, {
    onCompleted: () => {
      refetchFavorite();
    },
  });

  const barberShop: BarberShop = data?.barberShop;
  const isFavorite = favoriteData?.isFavorite;

  const handleToggleFavorite = async () => {
    if (!user) return;
    
    try {
      await toggleFavorite({
        variables: {
          userId: user.id,
          shopId: barberShopId,
        },
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderBarberCard = ({ item }: { item: Barber }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BarberDetail', { barberId: item.id })}
    >
      <Card style={styles.barberCard}>
        <Card.Content style={styles.barberContent}>
          <Avatar.Image
            size={60}
            source={{ uri: item.avatar || 'https://via.placeholder.com/60x60' }}
          />
          <View style={styles.barberInfo}>
            <Text style={styles.barberName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.barberSpecialty}>{item.specialties || 'Barber'}</Text>
            <Text style={styles.barberExperience}>{item.experienceYears || 0} years exp.</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {item.averageRating?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.reviewCount}>({item.totalRatings || 0})</Text>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Booking', { 
              barberId: item.id, 
              serviceId: barberShop?.services?.[0]?.id || '',
              barberShopId: barberShop.id
            })}
            compact
          >
            Book
          </Button>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderServiceCard = ({ item }: { item: ManagementService }) => (
    <Card style={styles.serviceCard}>
      <Card.Content>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.serviceCategory}>{item.category?.name}</Text>
            {item.description && (
              <Text style={styles.serviceDescription}>{item.description}</Text>
            )}
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.servicePrice}>${item.price}</Text>
            <Text style={styles.serviceDuration}>{item.durationMinutes}min</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderWorkingHours = () => {
    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const dayNames = {
      MONDAY: 'Monday',
      TUESDAY: 'Tuesday',
      WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday',
      FRIDAY: 'Friday',
      SATURDAY: 'Saturday',
      SUNDAY: 'Sunday',
    };

    return (
      <Card style={styles.hoursCard}>
        <Card.Content>
          <Text style={styles.hoursTitle}>Working Hours</Text>
          {daysOrder.map((day) => {
            const dayHours = barberShop?.workingHours?.find(h => h.dayOfWeek === day);
            return (
              <View key={day} style={styles.hourRow}>
                <Text style={styles.dayName}>{dayNames[day as keyof typeof dayNames]}</Text>
                <Text style={styles.hourTime}>
                  {dayHours && dayHours.isActive 
                    ? `${dayHours.startTime} - ${dayHours.endTime}`
                    : 'Closed'
                  }
                </Text>
              </View>
            );
          })}
        </Card.Content>
      </Card>
    );
  };

  if (loading || !barberShop) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Card.Cover
            source={{ uri: barberShop.coverPhoto || barberShop.avatar || 'https://via.placeholder.com/400x300' }}
            style={styles.coverImage}
          />
          <View style={styles.imageOverlay}>
            <IconButton
              icon="arrow-left"
              iconColor="#ffffff"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            {user && (
              <IconButton
                icon={isFavorite ? "heart" : "heart-outline"}
                iconColor={isFavorite ? "#E91E63" : "#ffffff"}
                size={24}
                onPress={handleToggleFavorite}
                style={styles.favoriteButton}
              />
            )}
          </View>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.shopName}>{barberShop.name}</Text>
            <Text style={styles.shopAddress}>
              {barberShop.address}, {barberShop.city}, {barberShop.state}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>★ {barberShop.averageRating?.toFixed(1) || 'N/A'}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{barberShop.totalRatings || 0}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{barberShop.favoriteCount || 0}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
            </View>

            <View style={styles.reviewsButtonContainer}>
              <Button
                mode="outlined"
                icon="star"
                onPress={() => navigation.navigate('Reviews', { 
                  entityId: barberShop.id, 
                  entityType: RatedType.BARBERSHOP,
                  entityName: barberShop.name
                })}
                style={styles.reviewsButton}
              >
                View Reviews
              </Button>
            </View>

            {barberShop.description && (
              <Text style={styles.description}>{barberShop.description}</Text>
            )}

            <View style={styles.contactInfo}>
              {barberShop.phone && (
                <Text style={styles.contactItem}>📞 {barberShop.phone}</Text>
              )}
              {barberShop.email && (
                <Text style={styles.contactItem}>✉️ {barberShop.email}</Text>
              )}
              {barberShop.website && (
                <Text style={styles.contactItem}>🌐 {barberShop.website}</Text>
              )}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.tabContainer}>
          <Chip
            selected={selectedTab === 'barbers'}
            onPress={() => setSelectedTab('barbers')}
            style={styles.tab}
          >
            Barbers ({barberShop.barbers?.length || 0})
          </Chip>
          <Chip
            selected={selectedTab === 'services'}
            onPress={() => setSelectedTab('services')}
            style={styles.tab}
          >
            Services ({barberShop.services?.length || 0})
          </Chip>
          <Chip
            selected={selectedTab === 'hours'}
            onPress={() => setSelectedTab('hours')}
            style={styles.tab}
          >
            Hours
          </Chip>
        </View>

        <View style={styles.tabContent}>
          {selectedTab === 'barbers' && (
            <FlatList
              data={barberShop.barbers || []}
              renderItem={renderBarberCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
          
          {selectedTab === 'services' && (
            <FlatList
              data={barberShop.services || []}
              renderItem={renderServiceCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
          
          {selectedTab === 'hours' && renderWorkingHours()}
        </View>
      </ScrollView>

      <FAB
        icon="calendar-plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Booking', { 
          barberId: barberShop.barbers?.[0]?.id || '',
          serviceId: barberShop.services?.[0]?.id || '',
          barberShopId: barberShop.id
        })}
        label="Book Now"
      />
    </View>
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
  imageContainer: {
    position: 'relative',
  },
  coverImage: {
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoCard: {
    margin: 16,
    elevation: 3,
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shopAddress: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  description: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  reviewsButtonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  reviewsButton: {
    borderColor: '#6200EE',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  barberCard: {
    marginBottom: 12,
    elevation: 2,
  },
  barberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
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
  barberExperience: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
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
  serviceCard: {
    marginBottom: 12,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceCategory: {
    fontSize: 12,
    color: '#6200EE',
    marginTop: 2,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  serviceDetails: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666666',
  },
  hoursCard: {
    elevation: 2,
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  hourTime: {
    fontSize: 14,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});