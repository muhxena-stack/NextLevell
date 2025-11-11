import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeTabs from './HomeTabs';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { Product } from '../types/types';

export type HomeStackParamList = {
  HomeTabs: undefined;
  ProductDetail: { product: Product };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeTabs" 
        component={HomeTabs} 
        options={{ 
          title: 'Katalog Produk',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={({ route }) => ({ 
          title: route.params.product.nama,
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
        })} 
      />
    </Stack.Navigator>
  );
};

export default HomeStack;