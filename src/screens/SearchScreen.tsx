import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Searchbar, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLazyQuery, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { BarberShop, Barber } from '../types';

type SearchScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Search'>;

const SEARCH_BARBERSHOPS = gql`
  query SearchBarberShops($name: String, $city: String, $state: String, $minRating: Float) {
    searchBarberShops(name: $name, city: $city, state: $state, minRating: $minRating) {
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

const SEARCH_BARBERS = gql`
  query SearchBarbers($name: String, $city: String, $state: String, $specialty: String, $minRating: Float) {
    searchBarbers(name: $name, city: $city, state: $state, specialty: $specialty, minRating: $minRating) {
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

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'shops' | 'barbers'>('shops');
  const [minRating, setMinRating] = useState<number | null>(null);

  const [searchBarberShops, { data: shopsData, loading: shopsLoading }] = useLazyQuery(SEARCH_BARBERSHOPS);
  const [searchBarbers, { data: barbersData, loading: barbersLoading }] = useLazyQuery(SEARCH_BARBERS);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    if (searchType === 'shops') {
      searchBarberShops({
        variables: {
          name: searchQuery,
          minRating: minRating,
        },
      });
    } else {
      searchBarbers({
        variables: {
          name: searchQuery,
          minRating: minRating,
        },
      });
    }
  };

  const renderBarberShopCard = ({ item }: { item: BarberShop }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BarberShopDetail', { barberShopId: item.id })}
    >
      <Card style={styles.card}>
        <Card.Cover 
          source={{ uri: item.coverPhoto || item.avatar || 'https://via.placeholder.com/300x200' }} 
          style={styles.cardImage}
        />
        <Card.Content>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>{item.address}</Text>
          <Text style={styles.cardLocation}>{item.city}, {item.state}</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {item.averageRating?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.reviewCount}>({item.totalRatings || 0})</Text>
            </View>
            <Text style={styles.favoriteCount}>♥ {item.favoriteCount || 0}</Text>
          </View>

          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderBarberCard = ({ item }: { item: Barber }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BarberDetail', { barberId: item.id })}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.barberContent}>
          <View style={styles.barberInfo}>
            <Text style={styles.barberName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.barberSpecialty}>{item.specialties || 'Professional Barber'}</Text>
            <Text style={styles.barberExperience}>{item.experienceYears || 0} years experience</Text>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {item.averageRating?.toFixed(1) || 'N/A'}</Text>
              <Text style={styles.reviewCount}>({item.totalRatings || 0})</Text>
            </View>

            {item.bio && (
              <Text style={styles.barberBio} numberOfLines={2}>
                {item.bio}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const getResultsData = () => {
    if (searchType === 'shops') {
      return shopsData?.searchBarberShops || [];
    } else {
      return barbersData?.searchBarbers || [];
    }
  };

  const getLoading = () => {
    return searchType === 'shops' ? shopsLoading : barbersLoading;
  };

  const hasSearched = () => {
    return (searchType === 'shops' && shopsData) || (searchType === 'barbers' && barbersData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        
        <Searchbar
          placeholder={`Search ${searchType === 'shops' ? 'barber shops' : 'barbers'}...`}
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />

        <View style={styles.segmentedButtons}>
          <Button
            mode={searchType === 'shops' ? "contained" : "outlined"}
            onPress={() => setSearchType('shops')}
            style={[styles.segmentButton, styles.segmentButtonLeft]}
            compact
          >
            Barber Shops
          </Button>
          <Button
            mode={searchType === 'barbers' ? "contained" : "outlined"}
            onPress={() => setSearchType('barbers')}
            style={[styles.segmentButton, styles.segmentButtonRight]}
            compact
          >
            Barbers
          </Button>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Minimum Rating:</Text>
          <View style={styles.ratingFilters}>
            <Chip
              selected={minRating === null}
              onPress={() => setMinRating(null)}
              style={styles.filterChip}
            >
              Any
            </Chip>
            <Chip
              selected={minRating === 3}
              onPress={() => setMinRating(3)}
              style={styles.filterChip}
            >
              3+
            </Chip>
            <Chip
              selected={minRating === 4}
              onPress={() => setMinRating(4)}
              style={styles.filterChip}
            >
              4+
            </Chip>
            <Chip
              selected={minRating === 4.5}
              onPress={() => setMinRating(4.5)}
              style={styles.filterChip}
            >
              4.5+
            </Chip>
          </View>
        </View>
      </View>

      <FlatList
        data={getResultsData()}
        renderItem={searchType === 'shops' ? renderBarberShopCard : renderBarberCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={getLoading()}
        onRefresh={handleSearch}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {!hasSearched() ? (
              <>
                <Text style={styles.emptyTitle}>Start Your Search</Text>
                <Text style={styles.emptySubtitle}>
                  Enter a search term to find {searchType === 'shops' ? 'barber shops' : 'barbers'} in your area
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>No Results Found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search terms or filters
                </Text>
              </>
            )}
          </View>
        }
      />
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
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  segmentedButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
  },
  segmentButtonLeft: {
    marginRight: 4,
  },
  segmentButtonRight: {
    marginLeft: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  ratingFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
  },
  cardImage: {
    height: 200,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  favoriteCount: {
    fontSize: 12,
    color: '#E91E63',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    lineHeight: 20,
  },
  barberContent: {
    paddingVertical: 16,
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  barberSpecialty: {
    fontSize: 14,
    color: '#6200EE',
    marginBottom: 4,
  },
  barberExperience: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  barberBio: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});