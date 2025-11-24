// src/navigation/MainTabs.tsx - UPDATED WITH STORE LOCATOR
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

// Import screens yang ada
import ProductCatalogScreen from '../screens/ProductCatalogScreen';
import ProfileTabScreen from '../screens/ProfileTabScreen';
import DeepLinkTester from '../components/DeepLinkTester';
import StoreLocatorScreen from '../screens/StoreLocatorScreen'; // ✅ IMPORT STORE LOCATOR

// ✅ BUAT temporary screens untuk yang missing
const HomeScreen = () => (
  <Text style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, textAlign: 'center' }}>
    🏠 Home Screen{'\n\n'}
    Ini adalah halaman beranda.{'\n'}
    Deep link: ecommerceapp://home
  </Text>
);

const ProductListScreen = () => (
  <Text style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, textAlign: 'center' }}>
    🛍️ Product List Screen{'\n\n'}
    Ini adalah halaman daftar produk.{'\n'}
    Deep link: ecommerceapp://products
  </Text>
);

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProductsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator(); // ✅ ADD STORE STACK

// Home Stack Navigator
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
  </HomeStack.Navigator>
);

// Products Stack Navigator
const ProductsStackNavigator = () => (
  <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
    <ProductsStack.Screen name="ProductsMain" component={ProductCatalogScreen} />
    <ProductsStack.Screen name="ProductList" component={ProductListScreen} />
  </ProductsStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileTabScreen} />
    <ProfileStack.Screen name="DeepLinkTester" component={DeepLinkTester} />
  </ProfileStack.Navigator>
);

// ✅ STORE Stack Navigator
const StoreStackNavigator = () => (
  <StoreStack.Navigator screenOptions={{ headerShown: false }}>
    <StoreStack.Screen name="StoreMain" component={StoreLocatorScreen} />
  </StoreStack.Navigator>
);

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        headerShown: false
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="ProductsTab" 
        component={ProductsStackNavigator}
        options={{
          title: 'Produk',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>🛍️</Text>
          ),
        }}
      />
      {/* ✅ ADD STORE LOCATOR TAB */}
      <Tab.Screen 
        name="StoreTab" 
        component={StoreStackNavigator}
        options={{
          title: 'Toko',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>🏪</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStackNavigator}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size - 4 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;