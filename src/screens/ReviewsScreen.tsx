import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Avatar, List, Divider, Chip } from 'react-native-paper';
import { Rating } from '../components/Rating';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { Rating as RatingType, RatedType, RatingStats } from '../types';
import { useAuth } from '../contexts/AuthContext';

type ReviewsScreenRouteProp = RouteProp<MainStackParamList, 'Reviews'>;
type ReviewsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Reviews'>;

interface Props {
  route: ReviewsScreenRouteProp;
  navigation: ReviewsScreenNavigationProp;
}

const GET_RATINGS = gql`
  query GetRatings($entityId: ID!, $entityType: RatedType!) {
    ratingsByEntity(entityId: $entityId, entityType: $entityType) {
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
      barberRater {
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
    ratingStats(entityId: $entityId, entityType: $entityType) {
      averageRating
      totalRatings
      ratingDistribution {
        oneStar
        twoStar
        threeStar
        fourStar
        fiveStar
      }
    }
  }
`;

const GET_RECENT_RATINGS = gql`
  query GetRecentRatings($entityId: ID!, $entityType: RatedType!) {
    recentRatingsByEntity(entityId: $entityId, entityType: $entityType) {
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
      barberRater {
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

export const ReviewsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { entityId, entityType, entityName } = route.params;
  const { user } = useAuth();
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { data, loading, error } = useQuery(GET_RATINGS, {
    variables: { entityId, entityType },
    skip: !entityId || !entityType,
  });

  const { data: recentData, loading: recentLoading } = useQuery(GET_RECENT_RATINGS, {
    variables: { entityId, entityType },
    skip: !entityId || !entityType || showAllReviews,
  });

  const ratings = showAllReviews ? data?.ratingsByEntity : recentData?.recentRatingsByEntity;
  const stats: RatingStats = data?.ratingStats;

  const renderStarDistribution = () => {
    if (!stats) return null;

    const distribution = [
      { stars: 5, count: stats.ratingDistribution.fiveStar },
      { stars: 4, count: stats.ratingDistribution.fourStar },
      { stars: 3, count: stats.ratingDistribution.threeStar },
      { stars: 2, count: stats.ratingDistribution.twoStar },
      { stars: 1, count: stats.ratingDistribution.oneStar },
    ];

    return (
      <View style={styles.distributionContainer}>
        {distribution.map((item) => (
          <View key={item.stars} style={styles.distributionRow}>
            <Text style={styles.starLabel}>{item.stars}★</Text>
            <View style={styles.distributionBar}>
              <View 
                style={[
                  styles.distributionFill,
                  { width: `${(item.count / stats.totalRatings) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.distributionCount}>{item.count}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRatingItem = ({ item }: { item: RatingType }) => {
    const reviewer = item.rater || item.barberRater;
    const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Anonymous';
    const reviewerAvatar = reviewer?.avatar;

    return (
      <Card style={styles.reviewCard}>
        <Card.Content>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
              <Avatar.Image
                size={40}
                source={reviewerAvatar ? { uri: reviewerAvatar } : undefined}
              />
              {!reviewerAvatar && (
                <Avatar.Text
                  size={40}
                  label={reviewerName.split(' ').map(n => n[0]).join('')}
                />
              )}
              <View style={styles.reviewerDetails}>
                <Text style={styles.reviewerName}>{reviewerName}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Rating rating={item.rating} size={16} disabled />
              <Text style={styles.ratingText}>{item.rating}/5</Text>
            </View>
          </View>
          
          {item.booking?.managementService && (
            <Chip 
              style={styles.serviceChip}
              textStyle={styles.serviceChipText}
            >
              {item.booking.managementService.name}
            </Chip>
          )}
          
          {item.comment && (
            <Text style={styles.reviewComment}>{item.comment}</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading || recentLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Error loading reviews: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.title}>Reviews for {entityName}</Text>
          {stats && (
            <View style={styles.statsContainer}>
              <View style={styles.averageRating}>
                <Text style={styles.averageRatingText}>{stats.averageRating.toFixed(1)}</Text>
                <Rating rating={stats.averageRating} size={20} disabled />
                <Text style={styles.totalRatings}>({stats.totalRatings} reviews)</Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Rating Distribution */}
      {stats && (
        <Card style={styles.distributionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Rating Distribution</Text>
            {renderStarDistribution()}
          </Card.Content>
        </Card>
      )}

      {/* Reviews */}
      <Card style={styles.reviewsCard}>
        <Card.Content>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              {showAllReviews ? 'All Reviews' : 'Recent Reviews'}
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowAllReviews(!showAllReviews)}
              style={styles.toggleButton}
            >
              {showAllReviews ? 'Show Recent' : 'Show All'}
            </Button>
          </View>
          
          {ratings && ratings.length > 0 ? (
            <FlatList
              data={ratings}
              renderItem={renderRatingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          )}
        </Card.Content>
      </Card>

      {/* Add Review Button */}
      <View style={styles.addReviewContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddReview', { entityId, entityType, entityName })}
          style={styles.addReviewButton}
        >
          Write a Review
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerCard: {
    margin: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    alignItems: 'center',
  },
  averageRating: {
    alignItems: 'center',
  },
  averageRatingText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  totalRatings: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  distributionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  distributionContainer: {
    paddingVertical: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starLabel: {
    width: 30,
    fontSize: 14,
    fontWeight: 'bold',
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#FFA500',
    borderRadius: 4,
  },
  distributionCount: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
    color: '#666666',
  },
  reviewsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    borderColor: '#6200EE',
  },
  reviewCard: {
    marginBottom: 12,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666666',
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  serviceChip: {
    alignSelf: 'flex-start',
    marginVertical: 8,
    backgroundColor: '#e3f2fd',
  },
  serviceChipText: {
    fontSize: 12,
    color: '#1976d2',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  noReviewsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
    padding: 20,
  },
  addReviewContainer: {
    padding: 16,
  },
  addReviewButton: {
    paddingVertical: 8,
  },
});