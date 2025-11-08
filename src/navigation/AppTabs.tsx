// src/navigation/AppTabs.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// ✅ Impor FontAwesome6 yang sudah Anda instal
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import HomeStack from './HomeStack';
import ProfileScreen from '../screens/ProfileScreen';
import { useCart } from '../context/CartContext'; 

const Tab = createBottomTabNavigator();

const AppTabs = () => {
    const { getTotalItems } = useCart();
    const cartCount = getTotalItems();

    return (
        <Tab.Navigator
            initialRouteName="HomeTab"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#FF4500', 
                tabBarInactiveTintColor: 'gray',
                tabBarIcon: ({ focused, color, size }) => {
                    // 🆕 Definisikan iconName sebagai string. 
                    // Tipe yang lebih ketat dapat menyebabkan masalah di sini.
                    let iconName: string; 

                    if (route.name === 'HomeTab') {
                        // Nama ikon FontAwesome6 yang valid untuk Katalog/Home
                        iconName = focused ? 'cubes' : 'cube'; 
                    } else if (route.name === 'ProfileTab') {
                        // Nama ikon FontAwesome6 yang valid untuk Profil
                        iconName = focused ? 'user' : 'user-gear'; 
                    } else {
                        iconName = 'circle-info'; // Ikon default
                    }
                    
                    // ✅ Menggunakan komponen FontAwesome6 dan menganggap iconName sebagai string valid.
                    // TypeScript error muncul karena tipe 'name' dari FontAwesome6 sangat spesifik.
                    // Kita bisa menggunakan 'as any' pada komponen FontAwesome6 jika error tetap muncul 
                    // (namun ini tidak direkomendasikan).
                    
                    // Menggunakan properti name yang diketik sebagai string (yang sudah diperbaiki) dan cast ke 'any' untuk mengatasi masalah tipe
                    return <FontAwesome6 name={iconName as any} size={size} color={color} />;
                },
                tabBarBadge: route.name === 'HomeTab' && cartCount > 0 ? cartCount : undefined,
                tabBarBadgeStyle: {
                    backgroundColor: '#007AFF', 
                    color: 'white'
                }
            })}
        >
            <Tab.Screen 
                name="HomeTab"
                component={HomeStack} 
                options={{ title: 'Katalog' }} 
            />
            <Tab.Screen 
                name="ProfileTab" 
                component={ProfileScreen} 
                options={{ title: 'Profil' }} 
            />
        </Tab.Navigator>
    );
};

export default AppTabs;