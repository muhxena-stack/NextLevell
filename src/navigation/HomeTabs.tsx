// src/navigation/HomeTabs.tsx
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import ProductCatalogScreen from '../screens/ProductCatalogScreen';
import { useFocusEffect } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const HomeTabs = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Tugas 4: Conditional Drawer Lock untuk Detail Product & Checkout
  useFocusEffect(
    React.useCallback(() => {
      const routeName = getFocusedRouteNameFromRoute(route);
      
      // Kunci drawer saat di Detail Product atau Checkout
      if (routeName === 'ProductDetail' || routeName === 'Checkout') {
        navigation.getParent()?.setOptions({
          swipeEnabled: false,
          drawerLockMode: 'locked-closed'
        });
      } else {
        // Buka kunci drawer untuk screen lainnya
        navigation.getParent()?.setOptions({
          swipeEnabled: true,
          drawerLockMode: 'unlocked'
        });
      }

      return () => {
        // Reset saat unmount
        navigation.getParent()?.setOptions({
          swipeEnabled: true,
          drawerLockMode: 'unlocked'
        });
      };
    }, [navigation, route])
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#007AFF',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: 'white',
          height: 3,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          textTransform: 'none',
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
        tabBarPressColor: 'rgba(255,255,255,0.2)',
        tabBarScrollEnabled: true,
        // Tugas 4: Swipe gesture configuration
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <Tab.Screen 
        name="Semua" 
        component={ProductCatalogScreen}
        initialParams={{ filter: 'all' }}
      />
      <Tab.Screen 
        name="Populer" 
        component={ProductCatalogScreen}
        initialParams={{ filter: 'Populer' }}
      />
      <Tab.Screen 
        name="Terbaru" 
        component={ProductCatalogScreen}
        initialParams={{ filter: 'Terbaru' }}
      />
      <Tab.Screen 
        name="Elektronik" 
        component={ProductCatalogScreen}
        initialParams={{ filter: 'Elektronik' }}
      />
      <Tab.Screen 
        name="Otomotif" 
        component={ProductCatalogScreen}
        initialParams={{ filter: 'Otomotif' }}
      />
      <Tab.Screen 
        name="Bayi" 
        component={ProductCatalogScreen}
        initialParams={{ filter: 'Bayi' }}
      />
      <Tab.Screen 
        name="Pakaian" 
        component={ProductCatalogScreen}
        initialParams={{ filter: 'Pakaian' }}
      />
      <Tab.Screen 
        name="Makanan" 
        component={ProductCatalogScreen}
        initialParams={{ filter: 'Makanan' }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;