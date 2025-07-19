# Barber Catalog Mobile - Setup Guide

## Quick Setup Instructions

### 1. Install Dependencies

```bash
cd barberCatalog-mobile
npm install
```

### 2. Configure Backend Connection

Update the GraphQL endpoint in `src/services/apollo.ts`:

```typescript
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql', // Update to your backend URL
});
```

### 3. Install Expo CLI (if not already installed)

```bash
npm install -g @expo/cli
```

### 4. Start the Development Server

```bash
npm start
```

### 5. Run on Device/Simulator

#### Option A: Using Expo Go App
1. Install Expo Go from App Store/Play Store
2. Scan the QR code from the terminal

#### Option B: Using Simulators
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## Detailed Setup

### Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Expo CLI**
4. **iOS Simulator** (for iOS development on Mac)
5. **Android Studio** (for Android development)

### Backend Requirements

Ensure your GraphQL backend is running with these endpoints:

- Authentication: `login`, `register`
- Barber Shops: `barberShops`, `searchBarberShops`
- Barbers: `barbers`, `searchBarbers`
- Bookings: `createBooking`, `bookingsByUser`
- Favorites: `favorites`, `toggleFavorite`
- Services: `managementServices`

### Environment Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
```

### Testing the App

1. **Start Backend**: Ensure your Spring Boot backend is running
2. **Test Registration**: Create a new user account
3. **Test Login**: Log in with created credentials
4. **Browse Shops**: Check if barber shops are loading
5. **Test Booking**: Try creating a booking

### Common Issues and Solutions

#### Metro Bundler Issues
```bash
npx expo start --clear
```

#### iOS Simulator Not Opening
- Ensure Xcode is installed
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

#### Android Emulator Issues
- Check Android Studio setup
- Ensure Android SDK is properly configured

#### GraphQL Connection Issues
- Verify backend URL is correct
- Check network connectivity
- Ensure backend CORS is configured for mobile access

### Development Tips

1. **Hot Reload**: Changes are automatically reflected
2. **Debugging**: Shake device or press Ctrl+M (Android) / Cmd+D (iOS)
3. **Logs**: Check terminal for error messages
4. **Network**: Use React Native Debugger for network inspection

### Building for Production

#### Android APK
```bash
eas build --platform android
```

#### iOS App
```bash
eas build --platform ios
```

### App Features Ready to Test

✅ **Authentication System**
- User registration (Customer/Barber)
- Login/logout functionality
- Secure token storage

✅ **Home Screen**
- Featured barber shops
- Quick navigation
- User welcome message

✅ **Explore & Search**
- Browse all barber shops
- Filter by city, rating
- Search functionality

✅ **Barber Shop Details**
- Shop information
- Barber listings
- Services offered
- Working hours
- Favorites toggle

✅ **Booking System**
- Service selection
- Date picker
- Time slot selection
- Booking confirmation

✅ **Booking Management**
- View user bookings
- Cancel bookings
- Filter by status

✅ **Favorites**
- Save favorite shops
- Quick access to favorites

✅ **User Profile**
- View profile information
- Account settings
- Logout option

### Next Steps for Enhancement

- Push notifications for booking reminders
- In-app messaging between users and barbers
- Photo upload for user profiles
- Advanced search filters
- Map integration for nearby shops
- Payment integration
- Rating and review system completion

The app is now ready for testing and development!