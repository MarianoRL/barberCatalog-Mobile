import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  disabled?: boolean;
  showRating?: boolean;
  style?: any;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  onRatingChange,
  size = 24,
  disabled = false,
  showRating = true,
  style,
}) => {
  const handleStarPress = (starIndex: number) => {
    if (!disabled && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const renderStar = (index: number) => {
    const isFilled = index < rating;
    const starName = isFilled ? 'star' : 'star-border';
    const starColor = isFilled ? '#FFA500' : '#E0E0E0';

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(index)}
        disabled={disabled}
        style={styles.star}
      >
        <MaterialIcons
          name={starName}
          size={size}
          color={starColor}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {[...Array(5)].map((_, index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});