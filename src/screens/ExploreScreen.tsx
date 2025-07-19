import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Searchbar, Button, Menu, Divider, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { BarberShop } from '../types';

type ExploreScreenNavigationProp = StackNavigationProp<MainStackParamList>;

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

const GET_CITIES = gql`
  query GetAvailableCities {
    getAvailableCities
  }
`;

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data: barberShopsData, loading } = useQuery(GET_BARBERSHOPS);
  const { data: citiesData } = useQuery(GET_CITIES);

  const filteredBarberShops = barberShopsData?.barberShops?.filter((shop: BarberShop) => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shop.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = !selectedCity || shop.city === selectedCity;
    return matchesSearch && matchesCity;
  }).sort((a: BarberShop, b: BarberShop) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'reviews':
        return (b.totalRatings || 0) - (a.totalRatings || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Barber Shops</Text>
        
        <Searchbar
          placeholder="Search barber shops..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.filterContainer}>
          <Menu
            visible={showCityMenu}
            onDismiss={() => setShowCityMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowCityMenu(true)}
                style={styles.filterButton}
              >
                {selectedCity || 'All Cities'}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSelectedCity(''); setShowCityMenu(false); }} title="All Cities" />
            <Divider />
            {citiesData?.getAvailableCities?.map((city: string) => (
              <Menu.Item
                key={city}
                onPress={() => { setSelectedCity(city); setShowCityMenu(false); }}
                title={city}
              />
            ))}
          </Menu>

          <Menu
            visible={showSortMenu}
            onDismiss={() => setShowSortMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowSortMenu(true)}
                style={styles.filterButton}
              >
                Sort by: {sortBy === 'name' ? 'Name' : sortBy === 'rating' ? 'Rating' : 'Reviews'}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSortBy('name'); setShowSortMenu(false); }} title="Name" />
            <Menu.Item onPress={() => { setSortBy('rating'); setShowSortMenu(false); }} title="Rating" />
            <Menu.Item onPress={() => { setSortBy('reviews'); setShowSortMenu(false); }} title="Reviews" />
          </Menu>
        </View>

        {(searchQuery || selectedCity) && (
          <View style={styles.activeFilters}>
            {searchQuery && (
              <Chip
                onClose={() => setSearchQuery('')}
                style={styles.filterChip}
              >
                Search: {searchQuery}
              </Chip>
            )}
            {selectedCity && (
              <Chip
                onClose={() => setSelectedCity('')}
                style={styles.filterChip}
              >
                City: {selectedCity}
              </Chip>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={filteredBarberShops || []}
        renderItem={renderBarberShopCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => {}}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
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
});