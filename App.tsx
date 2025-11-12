// App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/navigation/MainTabs';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Text, View } from 'react-native';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Screen untuk menampilkan history analytics
const AnalyticsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Screen History</Text>
    <Text style={{ marginTop: 10 }}>Lihat console untuk analytics</Text>
  </View>
);

const AppNavigator = () => {
  const { user } = useAuth();
  const [analyticsLog, setAnalyticsLog] = useState<string[]>([]);

  const handleStateChange = (state: any) => {
    if (state) {
      const currentRoute = state.routes[state.index];
      let routeName = currentRoute.name;
      
      // Navigasi deep untuk mendapatkan nama screen yang tepat
      if (currentRoute.state) {
        const innerState = currentRoute.state;
        const innerRoute = innerState.routes[innerState.index];
        routeName = innerRoute.name;
        
        if (innerRoute.state) {
          const deeperState = innerRoute.state;
          const deeperRoute = deeperState.routes[deeperState.index];
          routeName = deeperRoute.name;
        }
      }

      const logMessage = `[ANALYTICS] Rute dikunjungi: ${routeName}`;
      console.log(logMessage);
      
      // Simpan ke state untuk ditampilkan (optional)
      setAnalyticsLog(prev => [...prev.slice(-9), logMessage]);
    }
  };

  return (
    <NavigationContainer onStateChange={handleStateChange}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">
            {() => (
              <Drawer.Navigator
                screenOptions={{
                  drawerPosition: 'left',
                  drawerType: 'front',
                  headerShown: false,
                  swipeEnabled: true,
                  drawerStyle: {
                    width: 280,
                  },
                }}
              >
                <Drawer.Screen 
                  name="MainTabs" 
                  component={MainTabs}
                  options={{
                    title: 'Beranda',
                  }}
                />
                <Drawer.Screen 
                  name="Profile" 
                  component={ProfileScreen}
                  options={{
                    title: 'Profil',
                  }}
                />
                <Drawer.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{
                    title: 'Pengaturan',
                  }}
                />
                <Drawer.Screen 
                  name="Analytics" 
                  component={AnalyticsScreen}
                  options={{
                    title: 'Screen History',
                  }}
                />
              </Drawer.Navigator>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}