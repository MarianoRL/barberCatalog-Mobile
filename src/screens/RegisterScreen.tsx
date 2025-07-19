import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, TextInput, Snackbar } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMutation, gql } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { Role } from '../types';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      refreshToken
      user {
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
      barber {
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
      expiresIn
    }
  }
`;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.CUSTOMER);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  
  const { login } = useAuth();
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields');
      setShowError(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setShowError(true);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setShowError(true);
      return;
    }

    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            firstName,
            lastName,
            email,
            phone: phone || undefined,
            password,
            role,
          },
        },
      });

      if (data?.register) {
        const { token, refreshToken, user, barber } = data.register;
        await login(token, refreshToken, user || barber);
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      setShowError(true);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our barber community</Text>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Account Type</Text>
            <View style={styles.segmentedButtons}>
              <Button
                mode={role === Role.CUSTOMER ? "contained" : "outlined"}
                onPress={() => setRole(Role.CUSTOMER)}
                style={[styles.segmentButton, styles.segmentButtonLeft]}
                compact
              >
                Customer
              </Button>
              <Button
                mode={role === Role.BARBER ? "contained" : "outlined"}
                onPress={() => setRole(Role.BARBER)}
                style={[styles.segmentButton, styles.segmentButtonRight]}
                compact
              >
                Barber
              </Button>
            </View>

            <TextInput
              label="First Name*"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Last Name*"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Email*"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
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
              label="Password*"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TextInput
              label="Confirm Password*"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
            >
              Sign Up
            </Button>

            <View style={styles.signInContainer}>
              <Text>Already have an account? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                compact
              >
                Sign In
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setShowError(false),
        }}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#6200EE',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#757575',
  },
  form: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  segmentedButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
  },
  segmentButtonLeft: {
    marginRight: 4,
  },
  segmentButtonRight: {
    marginLeft: 4,
  },
  input: {
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});