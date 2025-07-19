import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BarberShopDetailScreen } from '../screens/BarberShopDetailScreen';
import { BarberDetailScreen } from '../screens/BarberDetailScreen';
import { EnhancedBookingScreen } from '../screens/EnhancedBookingScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import { AddReviewScreen } from '../screens/AddReviewScreen';
import { OwnerAnalytics } from '../screens/OwnerAnalytics';
import { OwnerAppointments } from '../screens/OwnerAppointments';
import { AddBarberShop } from '../screens/AddBarberShop';

export type MainStackParamList = {
  HomeTabs: undefined;
  BarberShopDetail: { barberShopId: string };
  BarberDetail: { barberId: string };
  Booking: { barberId?: string; serviceId?: string; barberShopId: string };
  Search: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  Reviews: { entityId: string; entityType: string; entityName: string };
  AddReview: { entityId: string; entityType: string; entityName: string; bookingId?: string };
  OwnerAnalytics: { shopId?: string };
  OwnerAppointments: undefined;
  AddBarberShop: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const HomeTabs: React.FC = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Explore':
              iconName = 'explore';
              break;
            case 'Bookings':
              iconName = 'calendar-today';
              break;
            case 'Favorites':
              iconName = 'favorite';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      {user?.role === Role.CUSTOMER && (
        <Tab.Screen name="Favorites" component={FavoritesScreen} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeTabs" 
        component={HomeTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BarberShopDetail" 
        component={BarberShopDetailScreen}
        options={{ title: 'Barber Shop Details' }}
      />
      <Stack.Screen 
        name="BarberDetail" 
        component={BarberDetailScreen}
        options={{ title: 'Barber Details' }}
      />
      <Stack.Screen 
        name="Booking" 
        component={EnhancedBookingScreen}
        options={{ title: 'Book Appointment' }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="Reviews" 
        component={ReviewsScreen}
        options={{ title: 'Reviews' }}
      />
      <Stack.Screen 
        name="AddReview" 
        component={AddReviewScreen}
        options={{ title: 'Add Review' }}
      />
      <Stack.Screen 
        name="OwnerAnalytics" 
        component={OwnerAnalytics}
        options={{ title: 'Analytics' }}
      />
      <Stack.Screen 
        name="OwnerAppointments" 
        component={OwnerAppointments}
        options={{ title: 'Appointments' }}
      />
      <Stack.Screen 
        name="AddBarberShop" 
        component={AddBarberShop}
        options={{ title: 'Add Barber Shop' }}
      />
    </Stack.Navigator>
  );
};