import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);

  const toggleGesture = () => {
    setIsGestureEnabled(!isGestureEnabled);
    Alert.alert('Pengaturan Drawer', `Swipe gesture ${!isGestureEnabled ? 'diaktifkan' : 'dinonaktifkan'}`);
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
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>Status Gesture: {isGestureEnabled ? 'AKTIF' : 'NONAKTIF'}</Text>
        <Text style={styles.infoSubtext}>Swipe dari tepi layar {isGestureEnabled ? 'dapat' : 'tidak dapat'} membuka drawer</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F7F7F7' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 20 },
  settingText: { fontSize: 16, color: '#333' },
  info: { backgroundColor: '#E3F2FD', padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  infoText: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  infoSubtext: { fontSize: 12, color: '#666' },
});

export default SettingsScreen;