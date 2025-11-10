import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
                    let iconName: string; 

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'cubes' : 'cube'; 
                    } else if (route.name === 'ProfileTab') {
                        iconName = focused ? 'user' : 'user-gear'; 
                    } else {
                        iconName = 'circle-info'; 
                    }
                    
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