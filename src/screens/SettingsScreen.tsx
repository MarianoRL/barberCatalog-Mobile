import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, List, Switch, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsScreenNavigationProp = StackNavigationProp<any, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear Apollo cache here if needed
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please contact support to delete your account.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <List.Item
            title="Enable Notifications"
            description="Allow the app to send notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Email Notifications"
            description="Receive booking confirmations via email"
            left={props => <List.Icon {...props} icon="email" />}
            right={() => (
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                disabled={!notifications}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Push Notifications"
            description="Receive push notifications on your device"
            left={props => <List.Icon {...props} icon="cellphone" />}
            right={() => (
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                disabled={!notifications}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Privacy & Location</Text>
          
          <List.Item
            title="Location Services"
            description="Allow app to access your location for nearby shops"
            left={props => <List.Icon {...props} icon="map-marker" />}
            right={() => (
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            description="Read our privacy policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Privacy Policy', 'Privacy policy would be shown here');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Terms of Service"
            description="Read our terms of service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Terms of Service', 'Terms of service would be shown here');
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <List.Item
            title="Dark Mode"
            description="Switch to dark theme"
            left={props => <List.Icon {...props} icon="weather-night" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Language"
            description="Choose your preferred language"
            left={props => <List.Icon {...props} icon="translate" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Language', 'Language selection would be shown here');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Clear Cache"
            description="Clear app cache and temporary files"
            left={props => <List.Icon {...props} icon="cached" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleClearCache}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <List.Item
            title="Help Center"
            description="Get help and support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Help Center', 'Help center would be shown here');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Contact Support"
            description="Get in touch with our support team"
            left={props => <List.Icon {...props} icon="message" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Contact Support', 'Support contact form would be shown here');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Rate App"
            description="Rate us on the app store"
            left={props => <List.Icon {...props} icon="star" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Rate App', 'Would open app store rating');
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <List.Item
            title="Export Data"
            description="Download your account data"
            left={props => <List.Icon {...props} icon="download" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Export Data', 'Data export would be initiated here');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Delete Account"
            description="Permanently delete your account"
            left={props => <List.Icon {...props} icon="delete" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleDeleteAccount}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About</Text>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          
          <Divider />
          
          <List.Item
            title="Build"
            description="Build 1.0.0 (2024)"
            left={props => <List.Icon {...props} icon="code-tags" />}
          />
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
    marginBottom: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
});