// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import { CartProvider } from './src/context/CartContext';
import CustomDrawer from './src/components/CustomDrawer';
import HomeTabs from './src/navigation/HomeTabs';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Define Drawer Param List
type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawer {...props} />}
          screenOptions={{
            drawerPosition: 'left',
            drawerType: 'front',
            gestureEnabled: false, // Default locked (Tugas 4)
            swipeEnabled: false,   // Default locked (Tugas 4)
          } as DrawerNavigationOptions}
        >
          <Drawer.Screen name="Home" component={HomeTabs} />
          <Drawer.Screen name="Profile" component={ProfileScreen} />
          <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}