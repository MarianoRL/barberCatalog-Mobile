import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';

const httpLink = createHttpLink({
  uri: 'http://192.168.1.146:8080/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('authToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
    
    // Provide more specific error information
    if (networkError.message === 'Network request failed') {
      console.log('❌ Cannot connect to backend server.');
      console.log('✅ Check that your backend server is running on http://192.168.1.146:8080');
      console.log('✅ Verify both devices are on the same WiFi network');
      console.log('✅ Check Windows Firewall settings for port 8080');
    }
    
    if (networkError.statusCode === 401) {
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('refreshToken');
    }
  }
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        barberShops: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        barbers: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        bookings: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});