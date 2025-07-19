import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, useMutation, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { Favorite } from '../types';
import { useAuth } from '../contexts/AuthContext';

type FavoritesScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const GET_FAVORITES = gql`
  query GetFavorites($userId: ID!) {
    favorites(userId: $userId) {
      id
      createdAt
      barberShop {
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
      }
    }
  }
`;

const REMOVE_FROM_FAVORITES = gql`
  mutation RemoveFromFavorites($userId: ID!, $shopId: ID!) {
    removeFromFavorites(userId: $userId, shopId: $shopId)
  }
`;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { user } = useAuth();

  const { data, loading, refetch } = useQuery(GET_FAVORITES, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  const [removeFromFavorites] = useMutation(REMOVE_FROM_FAVORITES, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleRemoveFromFavorites = async (shopId: string) => {
    try {
      await removeFromFavorites({
        variables: {
          userId: user?.id,
          shopId,
        },
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const renderFavoriteCard = ({ item }: { item: Favorite }) => (
    <Card style={styles.card}>
      <Card.Cover 
        source={{ uri: item.barberShop.coverPhoto || item.barberShop.avatar || 'https://via.placeholder.com/300x200' }} 
        style={styles.cardImage}
      />
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.barberShop.name}</Text>
            <Text style={styles.cardSubtitle}>{item.barberShop.city}, {item.barberShop.state}</Text>
            <Text style={styles.cardAddress}>{item.barberShop.address}</Text>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>
                ★ {item.barberShop.averageRating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.reviewCount}>
                ({item.barberShop.totalRatings || 0} reviews)
              </Text>
            </View>

            {item.barberShop.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.barberShop.description}
              </Text>
            )}
          </View>
          
          <IconButton
            icon="heart"
            iconColor="#E91E63"
            size={24}
            onPress={() => handleRemoveFromFavorites(item.barberShop.id)}
          />
        </View>
      </Card.Content>
      
      <Card.Actions>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('BarberShopDetail', { barberShopId: item.barberShop.id })}
        >
          View Details
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring and add your favorite barber shops to see them here
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Explore')}
        style={styles.exploreButton}
      >
        Explore Barber Shops
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {data?.favorites?.length || 0} favorite barber shops
        </Text>
      </View>

      <FlatList
        data={data?.favorites || []}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={refetch}
        ListEmptyComponent={renderEmptyState}
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
    paddingHorizontal: 16,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  exploreButton: {
    marginTop: 16,
  },
});