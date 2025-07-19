import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Text, TextInput, Button, Avatar, Switch, Divider } from 'react-native-paper';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

type EditProfileScreenNavigationProp = StackNavigationProp<any, 'EditProfile'>;

interface Props {
  navigation: EditProfileScreenNavigationProp;
}

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      phone
      avatar
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_BARBER = gql`
  mutation UpdateBarber($id: ID!, $input: UpdateBarberInput!) {
    updateBarber(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      phone
      avatar
      bio
      experienceYears
      specialties
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  // Barber-specific fields
  const [bio, setBio] = useState((user as any)?.bio || '');
  const [experienceYears, setExperienceYears] = useState((user as any)?.experienceYears?.toString() || '');
  const [specialties, setSpecialties] = useState((user as any)?.specialties || '');

  const [updateUserMutation] = useMutation(UPDATE_USER, {
    onCompleted: (data) => {
      updateUser(data.updateUser);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const [updateBarberMutation] = useMutation(UPDATE_BARBER, {
    onCompleted: (data) => {
      updateUser(data.updateBarber);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    setLoading(true);

    try {
      const baseInput = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
      };

      if (user?.role === Role.BARBER) {
        await updateBarberMutation({
          variables: {
            id: user.id,
            input: {
              ...baseInput,
              bio: bio.trim() || undefined,
              experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
              specialties: specialties.trim() || undefined,
            },
          },
        });
      } else {
        await updateUserMutation({
          variables: {
            id: user?.id,
            input: baseInput,
          },
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBarber = user?.role === Role.BARBER;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={80}
                source={avatar ? { uri: avatar } : undefined}
                style={styles.avatar}
              />
              {!avatar && (
                <Avatar.Text
                  size={80}
                  label={`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()}
                  style={styles.avatar}
                />
              )}
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Last Name *"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />

            <TextInput
              label="Avatar URL"
              value={avatar}
              onChangeText={setAvatar}
              style={styles.input}
              left={<TextInput.Icon icon="image" />}
              placeholder="https://example.com/avatar.jpg"
            />
          </Card.Content>
        </Card>

        {isBarber && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Professional Information</Text>
              
              <TextInput
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                style={styles.input}
                left={<TextInput.Icon icon="text" />}
                placeholder="Tell clients about yourself and your experience..."
              />

              <TextInput
                label="Years of Experience"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="numeric"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
              />

              <TextInput
                label="Specialties"
                value={specialties}
                onChangeText={setSpecialties}
                style={styles.input}
                left={<TextInput.Icon icon="scissors-cutting" />}
                placeholder="e.g., Haircuts, Beard trimming, Hair styling"
              />
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoValue}>{user?.role}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>

            <Text style={styles.noteText}>
              * Email and role cannot be changed. Contact support if needed.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
          >
            Save Changes
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
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    marginBottom: 12,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666666',
  },
  noteText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
});