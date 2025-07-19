# Barber Catalog Mobile App

A React Native Expo application for booking barber appointments, built with TypeScript and integrated with a GraphQL backend.

## Features

- **User Authentication**: Login/Register for customers and barbers
- **Barber Shop Discovery**: Browse and search barber shops by location, rating, and services
- **Barber Profiles**: View detailed barber information, specialties, and availability
- **Service Booking**: Book appointments with preferred barbers and services
- **Booking Management**: View, reschedule, and cancel appointments
- **Favorites**: Save favorite barber shops for quick access
- **Ratings & Reviews**: Rate and review barber shops and services
- **Real-time Availability**: Check barber availability and book time slots
- **User Profile Management**: Edit profile information and preferences

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and toolchain
- **TypeScript**: Type-safe JavaScript
- **Apollo Client**: GraphQL client for API communication
- **React Navigation**: Navigation library for React Native
- **React Native Paper**: Material Design components
- **AsyncStorage**: Local storage for authentication tokens

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/            # App screens/pages
├── services/           # API services (Apollo Client)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── theme/              # Theme configuration
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd barberCatalog-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the GraphQL endpoint**
   
   Update the GraphQL endpoint in `src/services/apollo.ts`:
   ```typescript
   const httpLink = createHttpLink({
     uri: 'http://your-backend-url:8080/graphql', // Update this URL
   });
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### Using Expo CLI

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Run on iOS Simulator**
   ```bash
   npm run ios
   ```

3. **Run on Android Emulator**
   ```bash
   npm run android
   ```

4. **Run on Web**
   ```bash
   npm run web
   ```

### Using Expo Go App

1. Install Expo Go on your iOS/Android device
2. Scan the QR code from the terminal/browser
3. The app will load on your device

## Backend Integration

This mobile app is designed to work with the Barber Catalog GraphQL backend. Ensure your backend is running and accessible at the configured endpoint.

### Required Backend Features

- User authentication (login/register)
- Barber shop management
- Barber profiles and services
- Booking system with availability
- Favorites and ratings
- Search functionality

## Key Screens

1. **Welcome Screen**: App introduction and navigation to auth screens
2. **Login/Register**: User authentication
3. **Home Screen**: Featured barber shops and quick actions
4. **Explore Screen**: Browse and filter barber shops
5. **Barber Shop Detail**: Detailed view with barbers, services, and hours
6. **Barber Detail**: Individual barber profile and services
7. **Booking Screen**: Service selection, date/time picker, and booking
8. **Bookings Screen**: View and manage user bookings
9. **Favorites Screen**: Saved barber shops
10. **Profile Screen**: User profile and settings
11. **Search Screen**: Advanced search with filters

## Configuration

### Environment Variables

Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_URL=http://your-backend-url:8080
```

### Theme Customization

Modify `src/theme/index.ts` to customize colors, fonts, and spacing:
```typescript
export const theme = {
  colors: {
    primary: '#6200EE',
    accent: '#03DAC6',
    // ... other colors
  },
  // ... other theme properties
};
```

## Development

### Adding New Screens

1. Create screen component in `src/screens/`
2. Add navigation types in navigation files
3. Update navigation configuration
4. Add any required GraphQL queries/mutations

### Adding New Components

1. Create component in `src/components/`
2. Export from appropriate index file
3. Add TypeScript interfaces if needed

### API Integration

1. Add GraphQL queries/mutations in screen files
2. Use Apollo Client hooks (useQuery, useMutation)
3. Handle loading states and errors
4. Update cache policies if needed

## Building for Production

### Android APK

```bash
eas build --platform android
```

### iOS App

```bash
eas build --platform ios
```

### Web Build

```bash
npm run build
```

## Testing

Run tests using:
```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS simulator not opening**: Ensure Xcode is installed and updated
3. **Android emulator issues**: Check Android Studio setup
4. **GraphQL errors**: Verify backend URL and network connectivity

### Debug Mode

Enable debug mode in development:
```bash
npm start -- --dev-client
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and support, please create an issue in the repository or contact the development team.