import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/MainNavigator';

type AddBarberShopNavigationProp = StackNavigationProp<MainStackParamList, 'AddBarberShop'>;

export const AddBarberShop: React.FC = () => {
  const navigation = useNavigation<AddBarberShopNavigationProp>();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Add New Barber Shop</Text>
          <Text style={styles.subtitle}>
            Create a new barber shop location
          </Text>
          <Text style={styles.comingSoon}>
            Coming Soon! This feature will allow you to:
          </Text>
          <Text style={styles.feature}>• Add new shop locations</Text>
          <Text style={styles.feature}>• Upload shop photos</Text>
          <Text style={styles.feature}>• Set shop details and hours</Text>
          <Text style={styles.feature}>• Assign barbers to shops</Text>
          <Text style={styles.feature}>• Configure services and pricing</Text>
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