// App.tsx - FLAT CONFIG FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StatusBar, ActivityIndicator, Text, Alert, Linking, Platform } from 'react-native';
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
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import { deepLinkingService } from './src/services/deepLinkingService';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// ✅ Define proper TypeScript types
type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Profile: { userId?: string };
  Settings: undefined;
  Analytics: undefined;
  NotFound: undefined;
};

// ✅ Simple loading screen
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
      Memuat aplikasi...
    </Text>
  </View>
);

// ✅ Simple analytics screen
const AnalyticsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Screen Analytics</Text>
    <Text style={{ marginTop: 10 }}>Lihat console untuk log navigasi</Text>
  </View>
);

// ✅ FIX: FLAT linking config - no nesting!
const linkingConfig = {
  prefixes: ['ecommerceapp://', 'https://miniecommerce.com'],
  
  async getInitialURL() {
    try {
      const url = await Linking.getInitialURL();
      console.log('🔗 Initial URL (Cold Start):', url);
      return url;
    } catch (error) {
      console.error('❌ Error getting initial URL:', error);
      return null;
    }
  },

  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({ url }: { url: string }) => {
      console.log('🔗 URL Received (Warm Start):', url);
      listener(url);
    };

    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      subscription.remove();
    };
  },

  // ✅ FLAT config - semua screens di root level
  config: {
    screens: {
      // ✅ SOAL 1: Basic routes
      Home: 'home',
      Products: 'products',
      
      // ✅ SOAL 2: Product detail dengan parameter
      ProductDetail: {
        path: 'product/:id',
        parse: {
          id: (id: string) => {
            const productId = parseInt(id, 10);
            return isNaN(productId) ? '-1' : id;
          }
        }
      },
      
      // ✅ SOAL 3: Cart route
      Cart: 'cart',
      
      // ✅ SOAL 4: Profile dengan validasi parameter
      Profile: {
        path: 'profile/:userId',
        parse: {
          userId: (userId: string) => {
            return userId && userId.length >= 3 ? userId : 'invalid';
          }
        }
      },
      
      // Additional routes
      Settings: 'settings',
      Analytics: 'analytics',
      Login: 'login',
      
      // ✅ SOAL 5: Fallback route
      NotFound: '*'
    }
  }
};

const AppNavigator = () => {
  const { user, isLoading, keychainError } = useAuth();
  const [analyticsLog, setAnalyticsLog] = useState<string[]>([]);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  // ✅ Initialize Deep Linking Service
  useEffect(() => {
    deepLinkingService.initialize();
  }, []);

  // ✅ Handle keychain access denied
  useEffect(() => {
    if (keychainError === 'KEYCHAIN_ACCESS_DENIED') {
      Alert.alert(
        'Perubahan Keamanan',
        'Keamanan perangkat Anda telah berubah. Silakan login ulang.',
        [{ text: 'OK' }]
      );
    }
  }, [keychainError]);

  // ✅ Handle Navigation State Changes
  const handleStateChange = (state: any) => {
    if (state) {
      const currentRoute = state.routes[state.index];
      let routeName = currentRoute.name;
      
      if (currentRoute.state) {
        const innerState = currentRoute.state;
        const innerRoute = innerState.routes[innerState.index];
        routeName = innerRoute.name;
      }

      const logMessage = `[NAVIGATION] Screen: ${routeName}`;
      console.log(logMessage);
      setAnalyticsLog(prev => [...prev.slice(-9), logMessage]);
    }
  };

  const handleErrorBoundaryReset = () => {
    setErrorBoundaryKey(prev => prev + 1);
    console.log('🔄 ErrorBoundary direset');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NetworkStatusBar />
      <OfflineBanner />
      
      {/* Debug Info */}
      {__DEV__ && (
        <View style={{ padding: 4, backgroundColor: '#e3f2fd' }}>
          <Text style={{ fontSize: 10, textAlign: 'center', color: '#1976d2' }}>
            🔗 Deep Linking Ready | {Platform.OS.toUpperCase()}
          </Text>
        </View>
      )}

      <NavigationContainer
        linking={linkingConfig}
        fallback={<LoadingScreen />}
        onStateChange={handleStateChange}
      >
        <ErrorBoundary key={errorBoundaryKey} onReset={handleErrorBoundaryReset}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user && !keychainError ? (
              // ✅ Authenticated user - Main app dengan Drawer
              <Stack.Screen name="Main">
                {() => (
                  <Drawer.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                      drawerPosition: 'left',
                      drawerType: 'front',
                      headerShown: false,
                      swipeEnabled: true,
                      drawerStyle: { width: 280 },
                    }}
                  >
                    <Drawer.Screen 
                      name="Home" 
                      component={MainTabs} 
                      options={{ title: 'Beranda' }} 
                    />
                    <Drawer.Screen 
                      name="Profile" 
                      component={ProfileScreen} 
                      options={{ title: 'Profil' }} 
                    />
                    <Drawer.Screen 
                      name="Settings" 
                      component={SettingsScreen} 
                      options={{ title: 'Pengaturan' }} 
                    />
                    <Drawer.Screen 
                      name="Analytics" 
                      component={AnalyticsScreen} 
                      options={{ title: 'Analytics' }} 
                    />
                  </Drawer.Navigator>
                )}
              </Stack.Screen>
            ) : (
              // ✅ Not authenticated - Login screen
              <Stack.Screen name="Login" component={LoginScreen} />
            )}
            
            {/* ✅ Direct deep link screens - bisa diakses dari mana saja */}
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
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