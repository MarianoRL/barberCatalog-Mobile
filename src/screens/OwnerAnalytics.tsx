import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/MainNavigator';

type OwnerAnalyticsScreenRouteProp = RouteProp<MainStackParamList, 'OwnerAnalytics'>;
type OwnerAnalyticsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'OwnerAnalytics'>;

interface Props {
  route: OwnerAnalyticsScreenRouteProp;
  navigation: OwnerAnalyticsScreenNavigationProp;
}

export const OwnerAnalytics: React.FC<Props> = ({ route, navigation }) => {
  const { shopId } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Owner Analytics</Text>
          <Text style={styles.subtitle}>
            {shopId ? `Analytics for Shop ID: ${shopId}` : 'Overall Analytics'}
          </Text>
          <Text style={styles.comingSoon}>
            Coming Soon! This feature will provide detailed analytics including:
          </Text>
          <Text style={styles.feature}>• Revenue tracking and trends</Text>
          <Text style={styles.feature}>• Appointment statistics</Text>
          <Text style={styles.feature}>• Customer insights</Text>
          <Text style={styles.feature}>• Performance metrics</Text>
          <Text style={styles.feature}>• Service popularity</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 24,
  },
  comingSoon: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  feature: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
});