import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Avatar, List, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { MainStackParamList } from '../navigation/MainNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList, 'HomeTabs'>;

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleDisplayName = (role: Role) => {
    switch (role) {
      case Role.CUSTOMER:
        return 'Customer';
      case Role.BARBER:
        return 'Barber';
      case Role.OWNER:
        return 'Shop Owner';
      case Role.ADMIN:
        return 'Administrator';
      default:
        return 'User';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Image
            size={80}
            source={user?.avatar ? { uri: user.avatar } : undefined}
            style={styles.avatar}
          />
          {!user?.avatar && (
            <Avatar.Text
              size={80}
              label={getInitials(user?.firstName || '', user?.lastName || '')}
              style={styles.avatar}
            />
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>{getRoleDisplayName(user?.role || Role.CUSTOMER)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <List.Item
            title="Email"
            description={user?.email}
            left={props => <List.Icon {...props} icon="email" />}
          />
          
          <Divider />
          
          <List.Item
            title="Phone"
            description={user?.phone || 'Not provided'}
            left={props => <List.Icon {...props} icon="phone" />}
          />
          
          <Divider />
          
          <List.Item
            title="Role"
            description={getRoleDisplayName(user?.role || Role.CUSTOMER)}
            left={props => <List.Icon {...props} icon="account-circle" />}
          />
          
          <Divider />
          
          <List.Item
            title="Member Since"
            description={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
        </Card.Content>
      </Card>

      {user?.role === Role.BARBER && (
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Barber Information</Text>
            
            <List.Item
              title="Experience"
              description={`${(user as any).experienceYears || 0} years`}
              left={props => <List.Icon {...props} icon="account-star" />}
            />
            
            <Divider />
            
            <List.Item
              title="Specialties"
              description={(user as any).specialties || 'Not specified'}
              left={props => <List.Icon {...props} icon="scissors-cutting" />}
            />
            
            <Divider />
            
            <List.Item
              title="Bio"
              description={(user as any).bio || 'No bio provided'}
              left={props => <List.Icon {...props} icon="information" />}
            />
          </Card.Content>
        </Card>
      )}

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          
          <Divider />
          
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ChangePassword')}
          />
          
          <Divider />
          
          <List.Item
            title="Settings"
            left={props => <List.Icon {...props} icon="cog" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings')}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Settings"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings')}
          />
          
          <Divider />
          
          <List.Item
            title="Help & Support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings')}
          />
        </Card.Content>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#F44336"
        >
          Sign Out
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Barber Catalog v1.0.0
        </Text>
      </View>
    </ScrollView>
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
    color: '#333333',
  },
  profileCard: {
    margin: 16,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: 'bold',
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logoutButton: {
    paddingVertical: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
  },
});