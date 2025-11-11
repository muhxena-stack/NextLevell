import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import HomeStack from './HomeStack';
import ProfileTabScreen from '../screens/ProfileTabScreen';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF4500',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'house' : 'house';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'user' : 'user';
          } else {
            iconName = 'circle-info';
          }
          
          return <FontAwesome6 name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ title: 'Beranda' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileTabScreen} 
        options={{ title: 'Profil' }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabs;