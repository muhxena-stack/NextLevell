// src/components/CustomDrawer.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  DrawerContentScrollView, 
  DrawerItem,
  DrawerNavigationProp 
} from '@react-navigation/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';

// Define parameter list
type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

type CustomDrawerNavigationProp = DrawerNavigationProp<DrawerParamList>;

const CustomDrawer = (props: any) => {
  const navigation = useNavigation<CustomDrawerNavigationProp>();
  
  const user = {
    name: 'NextLevel',
    email: 'pengguna123@email.com',
    avatar: 'https://via.placeholder.com/100/007AFF/FFFFFF?text=NL'
  };

  const handleLogout = () => {
    console.log('User logged out');
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const navigateToScreen = (screenName: keyof DrawerParamList) => {
    navigation.navigate(screenName);
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      {/* Header dengan Avatar */}
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <DrawerItem
        label="Home"
        onPress={() => navigateToScreen('Home')}
        labelStyle={styles.menuLabel}
      />
      <DrawerItem
        label="Profile" 
        onPress={() => navigateToScreen('Profile')}
        labelStyle={styles.menuLabel}
      />
      <DrawerItem
        label="Settings"
        onPress={() => navigateToScreen('Settings')}
        labelStyle={styles.menuLabel}
      />

      {/* Logout Button Terpisah */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

// Styles tetap sama...
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 'auto',
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomDrawer;