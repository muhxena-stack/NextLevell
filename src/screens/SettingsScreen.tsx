import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

// Define proper parameter list untuk Drawer
type DrawerParamList = {
  Home: undefined;
  Settings: undefined;
  Profile: undefined;
};

type SettingsScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);

  const toggleGesture = () => {
    setIsGestureEnabled(!isGestureEnabled);
    Alert.alert(
      'Pengaturan Drawer',
      `Swipe gesture ${!isGestureEnabled ? 'diaktifkan' : 'dinonaktifkan'}`,
      [{ text: 'OK' }]
    );
    console.log(`Swipe gesture: ${!isGestureEnabled}`);
  };

  const goHomeAndCloseDrawer = () => {
    // FIX: Gunakan DrawerActions.closeDrawer() dan navigate separately
    navigation.dispatch(DrawerActions.closeDrawer());
    navigation.navigate('Home');
  };

  const toggleDrawer = () => {
    // Contoh: Programmatic toggle drawer
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pengaturan</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Aktifkan Swipe Gesture Drawer</Text>
        <Switch
          value={isGestureEnabled}
          onValueChange={toggleGesture}
          trackColor={{ false: '#767577', true: '#007AFF' }}
          thumbColor={isGestureEnabled ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={goHomeAndCloseDrawer}>
        <Text style={styles.homeButtonText}>🏠 Ke Home & Tutup Drawer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={toggleDrawer}>
        <Text style={styles.toggleButtonText}>🔄 Toggle Drawer</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Status Gesture: {isGestureEnabled ? 'AKTIF' : 'NONAKTIF'}
        </Text>
        <Text style={styles.infoSubtext}>
          Swipe dari tepi layar {isGestureEnabled ? 'dapat' : 'tidak dapat'} membuka drawer
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  homeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#666',
  },
});

export default SettingsScreen;