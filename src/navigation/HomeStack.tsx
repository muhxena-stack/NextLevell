// src/navigation/HomeStack.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductCatalogScreen from '../screens/ProductCatalogScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { Product } from '../types/types'; // Import Product

// ➡️ Definisikan Tipe Home Stack
export type HomeStackParamList = {
  Catalog: undefined; 
  Detail: { product: Product }; 
};

// ➡️ Gunakan tipe ini
const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: '#007AFF' },
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Stack.Screen 
        name="Catalog" 
        component={ProductCatalogScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Detail" 
        component={ProductDetailScreen} 
        // FIX: Tipe kini dikenal
        options={({ route }) => ({ title: route.params.product.nama })} 
      />
    </Stack.Navigator>
  );
};

export default HomeStack;