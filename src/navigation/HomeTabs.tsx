import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ProductCatalogScreen from '../screens/ProductCatalogScreen';

const Tab = createMaterialTopTabNavigator();

// Filter products berdasarkan kategori (simulasi)
const PopularProducts = () => <ProductCatalogScreen filter="popular" />;
const NewProducts = () => <ProductCatalogScreen filter="new" />;
const DiscountProducts = () => <ProductCatalogScreen filter="discount" />;
const ElectronicProducts = () => <ProductCatalogScreen filter="electronic" />;
const ClothingProducts = () => <ProductCatalogScreen filter="clothing" />;
const FoodProducts = () => <ProductCatalogScreen filter="food" />;
const AutomotiveProducts = () => <ProductCatalogScreen filter="automotive" />;
const BabyProducts = () => <ProductCatalogScreen filter="baby" />;

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', // Biru primer
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: { backgroundColor: '#007AFF' }, // Garis biru
        tabBarLabelStyle: { textTransform: 'none', fontSize: 14 }, // Tidak uppercase
        tabBarStyle: { backgroundColor: 'white' },
        tabBarScrollEnabled: true, // Scroll horizontal (Tugas 5)
        lazy: true, // Lazy loading (Tugas 3)
        lazyPreloadDistance: 1, // Preload tab berdekatan (Tugas 3)
      }}
    >
      <Tab.Screen name="Populer" component={PopularProducts} />
      <Tab.Screen name="Terbaru" component={NewProducts} />
      <Tab.Screen name="Diskon" component={DiscountProducts} />
      <Tab.Screen name="Elektronik" component={ElectronicProducts} />
      <Tab.Screen name="Pakaian" component={ClothingProducts} />
      <Tab.Screen name="Makanan" component={FoodProducts} />
      <Tab.Screen name="Otomotif" component={AutomotiveProducts} />
      <Tab.Screen name="Bayi" component={BabyProducts} />
    </Tab.Navigator>
  );
};

export default HomeTabs;