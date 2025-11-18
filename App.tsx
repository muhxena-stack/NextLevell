// App.tsx - UPDATED
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StatusBar, ActivityIndicator, Text, Alert } from 'react-native';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import NetworkStatusBar from './src/components/NetworkStatusBar';
import OfflineBanner from './src/components/OfflineBanner';
import ErrorBoundary from './src/components/ErrorBoundary';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const AnalyticsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Screen History</Text>
    <Text style={{ marginTop: 10 }}>Lihat console untuk analytics</Text>
  </View>
);

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
      Memuat aplikasi dengan keamanan...
    </Text>
  </View>
);

const AppNavigator = () => {
  const { user, isLoading, keychainError } = useAuth();
  const [analyticsLog, setAnalyticsLog] = useState<string[]>([]);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  // ✅ Tugas c: Handle keychain access denied
  useEffect(() => {
    if (keychainError === 'KEYCHAIN_ACCESS_DENIED') {
      Alert.alert(
        'Perubahan Keamanan',
        'Keamanan perangkat Anda telah berubah. Silakan login ulang.',
        [{ text: 'OK' }]
      );
    }
  }, [keychainError]);

  const handleStateChange = (state: any) => {
    if (state) {
      const currentRoute = state.routes[state.index];
      let routeName = currentRoute.name;
      
      if (currentRoute.state) {
        const innerState = currentRoute.state;
        const innerRoute = innerState.routes[innerState.index];
        routeName = innerRoute.name;
      }

      const logMessage = `[ANALYTICS] Rute dikunjungi: ${routeName}`;
      console.log(logMessage);
      setAnalyticsLog(prev => [...prev.slice(-9), logMessage]);
    }
  };

  const handleErrorBoundaryReset = () => {
    setErrorBoundaryKey(prev => prev + 1);
    console.log('🔄 ErrorBoundary direset');
  };

  // ✅ Tugas a & c: Enhanced guard flow dengan keychain error handling
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NetworkStatusBar />
      <OfflineBanner />
      <NavigationContainer onStateChange={handleStateChange}>
        <ErrorBoundary key={errorBoundaryKey} onReset={handleErrorBoundaryReset}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user && !keychainError ? (
              // ✅ User terautentikasi dan tidak ada error keychain
              <Stack.Screen name="Main">
                {() => (
                  <Drawer.Navigator
                    screenOptions={{
                      drawerPosition: 'left',
                      drawerType: 'front',
                      headerShown: false,
                      swipeEnabled: true,
                      drawerStyle: { width: 280 },
                    }}
                  >
                    <Drawer.Screen name="MainTabs" component={MainTabs} options={{ title: 'Beranda' }} />
                    <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
                    <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Pengaturan' }} />
                    <Drawer.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Screen History' }} />
                  </Drawer.Navigator>
                )}
              </Stack.Screen>
            ) : (
              // ✅ User belum login atau ada error keychain
              <Stack.Screen name="Login" component={LoginScreen} />
            )}
          </Stack.Navigator>
        </ErrorBoundary>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <NetworkProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}