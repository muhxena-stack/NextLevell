// src/components/LocationPermission.tsx - LOCATION PERMISSION COMPONENT
import React from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { locationService } from '../services/locationService';

interface LocationPermissionProps {
  onPermissionGranted: () => void;
  onPermissionDenied?: () => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({
  onPermissionGranted,
  onPermissionDenied
}) => {
  
  const handleRequestPermission = async () => {
    try {
      const granted = await locationService.requestLocationPermission();
      
      if (granted) {
        console.log('✅ Location permission granted');
        onPermissionGranted();
      } else {
        console.log('❌ Location permission denied');
        Alert.alert(
          'Izin Ditolak',
          'Fitur toko terdekat membutuhkan akses lokasi. Anda dapat mengubah izin di pengaturan.',
          [{ text: 'OK' }]
        );
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('❌ Permission error:', error);
      Alert.alert('Error', 'Gagal meminta izin lokasi');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Akses Lokasi Diperlukan</Text>
      <Text style={styles.description}>
        Kami butuh lokasi Anda untuk menampilkan toko terdekat secara akurat dan menghitung ongkos kirim.
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleRequestPermission}
      >
        <Text style={styles.buttonText}>Izinkan Akses Lokasi</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        Data lokasi Anda aman dan hanya digunakan untuk keperluan layanan
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LocationPermission;