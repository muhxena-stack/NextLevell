// src/navigation/HomeTabs.tsx - UPDATE tabs
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ProductCatalogScreen from '../screens/ProductCatalogScreen';

const Tab = createMaterialTopTabNavigator();

// Buat component untuk setiap kategori
const PopularProducts = () => <ProductCatalogScreen filter="Populer" />;
const NewProducts = () => <ProductCatalogScreen filter="Terbaru" />;
const DiscountProducts = () => <ProductCatalogScreen filter="Diskon" />;
const ElectronicProducts = () => <ProductCatalogScreen filter="Elektronik" />;
const AutomotiveProducts = () => <ProductCatalogScreen filter="Otomotif" />;
const BabyProducts = () => <ProductCatalogScreen filter="Bayi" />;
const ClothingProducts = () => <ProductCatalogScreen filter="Pakaian" />;
const FoodProducts = () => <ProductCatalogScreen filter="Makanan" />;

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
        tabBarLabelStyle: { textTransform: 'none', fontSize: 12 },
        tabBarStyle: { backgroundColor: 'white' },
        tabBarScrollEnabled: true,
        lazy: true,
      }}
    >
      <Tab.Screen name="Populer" component={PopularProducts} />
      <Tab.Screen name="Terbaru" component={NewProducts} />
      <Tab.Screen name="Diskon" component={DiscountProducts} />
      <Tab.Screen name="Elektronik" component={ElectronicProducts} />
      <Tab.Screen name="Otomotif" component={AutomotiveProducts} />
      <Tab.Screen name="Bayi" component={BabyProducts} />
      <Tab.Screen name="Pakaian" component={ClothingProducts} />
      <Tab.Screen name="Makanan" component={FoodProducts} />
    </Tab.Navigator>
  );
};

export default HomeTabs;