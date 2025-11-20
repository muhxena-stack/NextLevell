// App.tsx - COMPLETE FIXED VERSION
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
import  DeepLinkTester  from './src/components/DeepLinkTester'; // ✅ FIX: Named import
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import { deepLinkingService } from './src/services/deepLinkingService';
import { ProtectedRoute } from './src/components/ProtectedRoute';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// ✅ Define proper TypeScript types
type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ProductDetail: { id: string };
  Cart: undefined;
  Checkout: { product?: any };
  Profile: { userId?: string };
  Settings: undefined;
  DeepLinkTester: undefined;
  NotFound: undefined;
};

// ✅ Loading screen
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
      Memuat aplikasi...
    </Text>
  </View>
);

// ✅ Component untuk handle deep link actions
const DeepLinkHandler: React.FC = () => {
  const navigation = useRef<any>(null); // ✅ FIX: Initialize with null
  const { isAuthenticated, isLoading } = useAuth();
  const [pendingDeepLink, setPendingDeepLink] = useState<{route: string, params: any} | null>(null);

  useEffect(() => {
    const unsubscribe = deepLinkingService.addListener((data) => {
      console.log('🔗 DeepLinkHandler received:', data);
      
      // ✅ Tugas j: Handle fallback navigation
      if (data.route === 'fallback') {
        Alert.alert('Info', data.params.message);
        navigation.current?.navigate('HomeTab');
        return;
      }

      // ✅ Tugas j: Handle post-login navigation
      if (!isAuthenticated && !isLoading) {
        if (data.route === 'product' || data.route === 'cart') {
          console.log('🔐 User not authenticated, storing deep link for post-login');
          setPendingDeepLink({ route: data.route, params: data.params });
          navigation.current?.navigate('Login');
          return;
        }
      }

      // Handle navigation based on deep link
      handleDeepLinkNavigation(data);
    });

    return unsubscribe;
  }, [isAuthenticated, isLoading]);

  // ✅ Tugas j: Process pending deep link setelah login
  useEffect(() => {
    if (isAuthenticated && pendingDeepLink) {
      console.log('🔄 Processing pending deep link after login:', pendingDeepLink);
      handleDeepLinkNavigation({
        route: pendingDeepLink.route,
        params: pendingDeepLink.params,
        url: '',
        timestamp: Date.now(),
        type: 'warm_start'
      });
      setPendingDeepLink(null);
    }
  }, [isAuthenticated, pendingDeepLink]);

  const handleDeepLinkNavigation = (data: any) => {
    switch (data.route) {
      case 'product':
        if (data.params.id && data.params.id !== 'invalid') {
          navigation.current?.navigate('ProductDetail', { id: data.params.id });
        }
        break;
      case 'cart':
        navigation.current?.navigate('Cart');
        break;
      case 'profile':
        if (data.params.userId && data.params.userId !== 'invalid') {
          navigation.current?.navigate('Profile', { userId: data.params.userId });
        }
        break;
      case 'home':
        navigation.current?.navigate('HomeTab');
        break;
      default:
        console.log('🔄 No specific navigation for:', data.route);
    }
  };

  return null;
};

const AppNavigator = () => {
  const { user, isLoading, keychainError } = useAuth();
  const [analyticsLog, setAnalyticsLog] = useState<string[]>([]);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  // ✅ Initialize Deep Linking Service
  useEffect(() => {
    deepLinkingService.initialize().then(() => {
      console.log('✅ Deep Linking integrated in App');
    });
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
      <DeepLinkHandler />
      
      {/* Debug Info */}
      {__DEV__ && (
        <View style={{ padding: 4, backgroundColor: '#e3f2fd' }}>
          <Text style={{ fontSize: 10, textAlign: 'center', color: '#1976d2' }}>
            🔗 Deep Linking Ready | {Platform.OS.toUpperCase()} | Auth: {user ? 'YES' : 'NO'}
          </Text>
        </View>
      )}

      <NavigationContainer
        linking={{
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

          // ✅ Tugas j: Complete config dengan validasi
          config: {
            screens: {
              // Basic routes
              HomeTab: 'home',
              ProductsTab: 'products',
              
              // ✅ Product detail dengan validasi parameter
              ProductDetail: {
                path: 'product/:id',
                parse: {
                  id: (id: string) => {
                    // ✅ Validasi: ID harus angka
                    if (!id || !/^\d+$/.test(id)) {
                      console.warn('❌ Invalid product ID, triggering fallback');
                      deepLinkingService.simulateDeepLink('fallback', {
                        reason: 'invalid_product_id',
                        message: 'Tautan tidak valid, dialihkan ke beranda'
                      });
                      return 'invalid';
                    }
                    return id;
                  }
                }
              },
              
              // Cart route
              Cart: 'cart',
              
              // ✅ Profile dengan validasi parameter
              Profile: {
                path: 'profile/:userId',
                parse: {
                  userId: (userId: string) => {
                    // ✅ Validasi: User ID harus alphanumeric
                    if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) {
                      console.warn('❌ Invalid user ID, triggering fallback');
                      deepLinkingService.simulateDeepLink('fallback', {
                        reason: 'invalid_user_id', 
                        message: 'Tautan tidak valid, dialihkan ke beranda'
                      });
                      return 'invalid';
                    }
                    return userId;
                  }
                }
              },
              
              // Additional routes
              Settings: 'settings',
              DeepLinkTester: 'debug',
              Login: 'login',
              
              // ✅ Fallback route
              NotFound: '*'
            }
          }
        }}
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
                      options={{ title: '🏠 Beranda' }} 
                    />
                    <Drawer.Screen 
                      name="Profile" 
                      component={ProfileScreen} 
                      options={{ title: '👤 Profil' }} 
                    />
                    <Drawer.Screen 
                      name="Settings" 
                      component={SettingsScreen} 
                      options={{ title: '⚙️ Pengaturan' }} 
                    />
                    <Drawer.Screen 
                      name="DeepLinkTester" 
                      component={DeepLinkTester} 
                      options={{ title: '🔗 Debug Deep Links' }} 
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
            
            {/* ✅ Protected screens - akan redirect ke login jika tidak authenticated */}
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
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