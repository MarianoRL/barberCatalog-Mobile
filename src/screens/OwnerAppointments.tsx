import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/MainNavigator';

type OwnerAppointmentsNavigationProp = StackNavigationProp<MainStackParamList, 'OwnerAppointments'>;

export const OwnerAppointments: React.FC = () => {
  const navigation = useNavigation<OwnerAppointmentsNavigationProp>();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Owner Appointments</Text>
          <Text style={styles.subtitle}>
            Manage appointments across all your shops
          </Text>
          <Text style={styles.comingSoon}>
            Coming Soon! This feature will provide:
          </Text>
          <Text style={styles.feature}>• All appointments across your shops</Text>
          <Text style={styles.feature}>• Advanced filtering and search</Text>
          <Text style={styles.feature}>• Appointment status management</Text>
          <Text style={styles.feature}>• Revenue tracking</Text>
          <Text style={styles.feature}>• Customer management</Text>
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