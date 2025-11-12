// src/navigation/HomeStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import HomeTabs from './HomeTabs';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import { Product } from '../types/types';

export type HomeStackParamList = {
  HomeTabs: undefined;
  ProductDetail: { product: Product };
  Checkout: { product: Product };
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
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={({ route }) => ({ 
          title: route.params.product.nama,
          headerStyle: { 
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: { 
            fontWeight: '600',
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
        })} 
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
    </Stack.Navigator>
  );
};

export default HomeStack;