import React from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Avatar, IconButton, Chip } from 'react-native-paper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { Barber, ManagementService, RatedType } from '../types';

type BarberDetailScreenRouteProp = RouteProp<MainStackParamList, 'BarberDetail'>;
type BarberDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'BarberDetail'>;

interface Props {
  route: BarberDetailScreenRouteProp;
  navigation: BarberDetailScreenNavigationProp;
}

const GET_BARBER_DETAIL = gql`
  query GetBarberDetail($id: ID!) {
    barber(id: $id) {
      id
      firstName
      lastName
      email
      phone
      avatar
      bio
      experienceYears
      specialties
      averageRating
      totalRatings
      barberShops {
        id
        name
        address
        city
        state
        avatar
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
        barberShop {
          id
          name
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

export const BarberDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barberId } = route.params;

  const { data, loading } = useQuery(GET_BARBER_DETAIL, {
    variables: { id: barberId },
  });

  const barber: Barber = data?.barber;

  const renderServiceCard = ({ item }: { item: ManagementService }) => (
    <Card style={styles.serviceCard}>
      <Card.Content>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.serviceShop}>{item.barberShop?.name}</Text>
            <Text style={styles.serviceCategory}>{item.category?.name}</Text>
            {item.description && (
              <Text style={styles.serviceDescription}>{item.description}</Text>
            )}
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.servicePrice}>${item.price}</Text>
            <Text style={styles.serviceDuration}>{item.durationMinutes}min</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Booking', { 
                barberId: barber.id, 
                serviceId: item.id,
                barberShopId: item.barberShop.id
              })}
              compact
              style={styles.bookButton}
            >
              Book
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderShopCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BarberShopDetail', { barberShopId: item.id })}
    >
      <Card style={styles.shopCard}>
        <Card.Content style={styles.shopContent}>
          <Avatar.Image
            size={50}
            source={{ uri: item.avatar || 'https://via.placeholder.com/50x50' }}
          />
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{item.name}</Text>
            <Text style={styles.shopAddress}>
              {item.address}, {item.city}, {item.state}
            </Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={20}
          />
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
            const dayHours = barber?.workingHours?.find(h => h.dayOfWeek === day);
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

  if (loading || !barber) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Image
            size={100}
            source={{ uri: barber.avatar || 'https://via.placeholder.com/100x100' }}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.barberName}>{barber.firstName} {barber.lastName}</Text>
            <Text style={styles.barberSpecialty}>{barber.specialties || 'Professional Barber'}</Text>
            <Text style={styles.barberExperience}>{barber.experienceYears || 0} years of experience</Text>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {barber.averageRating?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.reviewCount}>({barber.totalRatings || 0} reviews)</Text>
            </View>

            <View style={styles.reviewsButtonContainer}>
              <Button
                mode="outlined"
                icon="star"
                onPress={() => navigation.navigate('Reviews', { 
                  entityId: barber.id, 
                  entityType: RatedType.BARBER,
                  entityName: `${barber.firstName} ${barber.lastName}`
                })}
                style={styles.reviewsButton}
              >
                View Reviews
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      {barber.bio && (
        <Card style={styles.bioCard}>
          <Card.Content>
            <Text style={styles.bioTitle}>About Me</Text>
            <Text style={styles.bioText}>{barber.bio}</Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.contactCard}>
        <Card.Content>
          <Text style={styles.contactTitle}>Contact Information</Text>
          {barber.phone && (
            <Text style={styles.contactItem}>📞 {barber.phone}</Text>
          )}
          <Text style={styles.contactItem}>✉️ {barber.email}</Text>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        <FlatList
          data={barber.services || []}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Works At</Text>
        <FlatList
          data={barber.barberShops || []}
          renderItem={renderShopCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Working Hours</Text>
        {renderWorkingHours()}
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
  profileCard: {
    margin: 16,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  barberName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  barberSpecialty: {
    fontSize: 16,
    color: '#6200EE',
    marginBottom: 4,
  },
  barberExperience: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#FFA500',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666666',
  },
  reviewsButtonContainer: {
    marginTop: 16,
  },
  reviewsButton: {
    borderColor: '#6200EE',
  },
  bioCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  contactCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
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
  serviceShop: {
    fontSize: 14,
    color: '#6200EE',
    marginTop: 2,
  },
  serviceCategory: {
    fontSize: 12,
    color: '#666666',
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
    marginBottom: 8,
  },
  bookButton: {
    marginTop: 4,
  },
  shopCard: {
    marginBottom: 12,
    elevation: 2,
  },
  shopContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopInfo: {
    flex: 1,
    marginLeft: 12,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopAddress: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  hoursCard: {
    elevation: 2,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  hourTime: {
    fontSize: 14,
    color: '#666666',
  },
});