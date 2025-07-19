import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Text, Button, TextInput } from 'react-native-paper';
import { Rating } from '../components/Rating';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMutation, gql } from '@apollo/client';
import { MainStackParamList } from '../navigation/MainNavigator';
import { CreateRatingInput, RatedType } from '../types';
import { useAuth } from '../contexts/AuthContext';

type AddReviewScreenRouteProp = RouteProp<MainStackParamList, 'AddReview'>;
type AddReviewScreenNavigationProp = StackNavigationProp<MainStackParamList, 'AddReview'>;

interface Props {
  route: AddReviewScreenRouteProp;
  navigation: AddReviewScreenNavigationProp;
}

const CREATE_RATING = gql`
  mutation CreateRating($input: CreateRatingInput!) {
    createRating(input: $input) {
      id
      rating
      comment
      createdAt
      rater {
        id
        firstName
        lastName
      }
    }
  }
`;

const CREATE_USER_RATING = gql`
  mutation CreateUserRating(
    $userId: ID!
    $entityId: ID!
    $entityType: RatedType!
    $rating: Int!
    $comment: String
    $bookingId: ID
  ) {
    createUserRating(
      userId: $userId
      entityId: $entityId
      entityType: $entityType
      rating: $rating
      comment: $comment
      bookingId: $bookingId
    ) {
      id
      rating
      comment
      createdAt
      rater {
        id
        firstName
        lastName
      }
    }
  }
`;

export const AddReviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { entityId, entityType, entityName, bookingId } = route.params;
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const [createRating] = useMutation(CREATE_RATING, {
    onCompleted: (data) => {
      Alert.alert('Success', 'Your review has been submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to submit review: ${error.message}`);
    },
    refetchQueries: ['GetRatings', 'GetRecentRatings'],
  });

  const [createUserRating] = useMutation(CREATE_USER_RATING, {
    onCompleted: (data) => {
      Alert.alert('Success', 'Your review has been submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', `Failed to submit review: ${error.message}`);
    },
    refetchQueries: ['GetRatings', 'GetRecentRatings'],
  });

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a review');
      return;
    }

    setLoading(true);

    try {
      const input: CreateRatingInput = {
        userId: user.id,
        entityId,
        entityType,
        rating,
        comment: comment.trim() || undefined,
        bookingId: bookingId || undefined,
      };

      // Use the more specific createUserRating mutation
      await createUserRating({
        variables: {
          userId: user.id,
          entityId,
          entityType,
          rating,
          comment: comment.trim() || undefined,
          bookingId: bookingId || undefined,
        },
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingDescription = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Select a rating';
    }
  };

  const getEntityTypeDisplay = (type: RatedType) => {
    switch (type) {
      case RatedType.BARBER:
        return 'barber';
      case RatedType.BARBERSHOP:
        return 'barbershop';
      case RatedType.USER:
        return 'user';
      default:
        return 'service';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Write a Review</Text>
            <Text style={styles.subtitle}>
              Share your experience with {entityName}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <Text style={styles.sectionDescription}>
              How would you rate this {getEntityTypeDisplay(entityType)}?
            </Text>
            
            <View style={styles.ratingContainer}>
              <Rating
                rating={rating}
                onRatingChange={setRating}
                size={40}
                showRating={false}
                style={styles.rating}
              />
              <Text style={styles.ratingDescription}>
                {getRatingDescription(rating)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <Text style={styles.sectionDescription}>
              Tell others about your experience (optional)
            </Text>
            
            <TextInput
              label="Write your review..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={6}
              style={styles.commentInput}
              placeholder="Share details about your experience..."
              maxLength={500}
            />
            
            <Text style={styles.characterCount}>
              {comment.length}/500 characters
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Review Guidelines</Text>
            <Text style={styles.guidelineText}>
              • Be honest and constructive in your feedback
            </Text>
            <Text style={styles.guidelineText}>
              • Focus on your specific experience
            </Text>
            <Text style={styles.guidelineText}>
              • Avoid personal attacks or offensive language
            </Text>
            <Text style={styles.guidelineText}>
              • Reviews are public and can be seen by others
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmitReview}
            loading={loading}
            disabled={loading || rating === 0}
            style={styles.submitButton}
          >
            Submit Review
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  rating: {
    marginBottom: 12,
  },
  ratingDescription: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  commentInput: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  guidelineText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
});