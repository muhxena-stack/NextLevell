// src/navigation/HomeStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import HomeTabs from './HomeTabs';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ProductListScreen from '../screens/ProductListScreen';
import CartScreen from '../screens/CartScreen';
import { Product, ApiProduct } from '../types/types'; // Import both types

export type HomeStackParamList = {
  HomeTabs: undefined;
  ProductDetail: { product: Product | ApiProduct }; // Accept both types
  Checkout: { product: Product };
  ProductList: undefined;
  Cart: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = ({ navigation }: any) => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeTabs" 
        component={HomeTabs} 
        options={{ 
          title: 'Katalog Produk',
          headerStyle: { 
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: { 
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.toggleDrawer()}
              style={{ marginRight: 15 }}
            >
              <FontAwesome6 name="bars" size={20} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen 
        name="ProductList" 
        component={ProductListScreen} 
        options={{ 
          title: 'Daftar Produk API',
          headerStyle: { 
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: { 
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ 
          title: 'Keranjang',
          headerStyle: { 
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: { 
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={({ route }) => { 
          // Handle both Product and ApiProduct types
          const product = route.params.product;
          const title = 'title' in product ? product.title : product.nama;
          
          return {
            title: title || 'Detail Produk',
            headerStyle: { 
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: { 
              fontWeight: '600',
            },
            headerShadowVisible: false,
          };
        }} 
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen} 
        options={{ 
          title: 'Checkout',
          headerStyle: { 
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: { 
            fontWeight: '600',
          },
          headerShadowVisible: false,
          presentation: 'modal',
        }} 
      />
    </Stack.Navigator>
  );
};

export default HomeStack;