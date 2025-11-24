// src/screens/StoreLocatorScreen.tsx - UPDATED WITH PERMISSION HANDLING
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { locationService } from '../services/locationService';
import LocationPermission from '../components/LocationPermission';
import { useAuth } from '../context/AuthContext';

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

const StoreLocatorScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [nearestStore, setNearestStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [hasLocationAccess, setHasLocationAccess] = useState(false); // ✅ NEW: Track actual access
  const [trackingWatchId, setTrackingWatchId] = useState<number | null>(null);

  // Sample stores data
  const sampleStores: Store[] = [
    {
      id: '1',
      name: 'Toko Utama',
      address: 'Jl. Sudirman No. 123, Jakarta',
      latitude: -6.2088,
      longitude: 106.8456
    },
    {
      id: '2', 
      name: 'Toko Cabang Senayan',
      address: 'Jl. Senayan Raya No. 45, Jakarta',
      latitude: -6.2275,
      longitude: 106.8004
    },
    {
      id: '3',
      name: 'Toko Cabang BSD',
      address: 'Jl. BSD Green Office Park, Tangerang',
      latitude: -6.3025,
      longitude: 106.6522
    }
  ];

  // ✅ SOAL 3: Cleanup tracking on unmount
  useEffect(() => {
    return () => {
      if (trackingWatchId) {
        locationService.stopLocationTracking(trackingWatchId);
      }
    };
  }, [trackingWatchId]);

  const handlePermissionGranted = async () => {
    setPermissionGranted(true);
    setHasLocationAccess(true);
    await getCurrentLocation();
  };

  // ✅ NEW: Handle when user denies permission
  const handlePermissionDenied = () => {
    console.log('❌ User denied location permission');
    setPermissionGranted(true); // Tetap lanjut ke main screen
    setHasLocationAccess(false);
    
    // Tampilkan toko tanpa distance
    const storesWithoutDistance = sampleStores.map(store => ({
      ...store,
      distance: undefined
    }));
    setStores(storesWithoutDistance);
    setNearestStore(storesWithoutDistance[0]);
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      await calculateStoreDistances(location);
      
    } catch (error: any) {
      console.error('❌ Location error:', error);
      Alert.alert('Error', 'Gagal mendapatkan lokasi');
    } finally {
      setLoading(false);
    }
  };

  const calculateStoreDistances = async (userLocation: any) => {
    const storesWithDistance = sampleStores.map(store => {
      const distance = locationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        store.latitude,
        store.longitude
      );
      
      return {
        ...store,
        distance: Math.round(distance)
      };
    });

    // Sort by distance
    storesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    setStores(storesWithDistance);
    setNearestStore(storesWithDistance[0]);
  };

  // ✅ SOAL 5: Geofencing untuk promo
  const startStoreGeofencing = () => {
    if (!currentLocation || !nearestStore) {
      Alert.alert('Info', 'Lokasi tidak tersedia untuk geofencing');
      return;
    }

    const watchId = locationService.startGeofencing(
      {
        latitude: nearestStore.latitude,
        longitude: nearestStore.longitude
      },
      100, // 100 meter radius
      () => {
        Alert.alert(
          '🎉 PROMO DEKAT TOKO!',
          `Anda berada dekat ${nearestStore.name}. Dapatkan diskon 20% untuk pembelian pertama!`,
          [{ text: 'Lihat Promo' }]
        );
      }
    );

    setTrackingWatchId(watchId);
    Alert.alert('Info', 'Promo tracking diaktifkan. Anda akan dapat notifikasi saat dekat toko.');
  };

  // ✅ SOAL 4: Send location to server untuk analytics
  const sendAnalyticsLocation = async () => {
    try {
      await locationService.sendLocationToServer();
      Alert.alert('Success', 'Data lokasi terkirim untuk analitik');
    } catch (error) {
      console.error('❌ Analytics error:', error);
      Alert.alert('Error', 'Gagal mengirim data lokasi');
    }
  };

  const renderStoreItem = (store: Store) => (
    <View key={store.id} style={styles.storeCard}>
      <Text style={styles.storeName}>{store.name}</Text>
      <Text style={styles.storeAddress}>{store.address}</Text>
      {store.distance ? (
        <Text style={styles.storeDistance}>
          🚗 {store.distance >= 1000 
            ? `${(store.distance / 1000).toFixed(1)} km` 
            : `${store.distance} meter`
          }
        </Text>
      ) : (
        <Text style={styles.storeNoDistance}>
          📍 Jarak tidak tersedia
        </Text>
      )}
    </View>
  );

  // Show permission screen if not granted yet
  if (!permissionGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏪 Toko Terdekat</Text>
        </View>
        <LocationPermission 
          onPermissionGranted={handlePermissionGranted} 
          onPermissionDenied={handlePermissionDenied} // ✅ PASS DENIED HANDLER
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏪 Toko Terdekat</Text>
        <Text style={styles.headerSubtitle}>
          {hasLocationAccess 
            ? (currentLocation 
                ? `Lokasi Anda: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`
                : 'Mendeteksi lokasi...'
              )
            : '📍 Akses lokasi tidak diizinkan - tampilkan semua toko'
          }
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Mendeteksi lokasi...</Text>
          </View>
        ) : (
          <>
            {/* Nearest Store */}
            {nearestStore && (
              <View style={styles.nearestStoreSection}>
                <Text style={styles.sectionTitle}>
                  {hasLocationAccess ? '📍 Toko Terdekat' : '🏪 Semua Toko'}
                </Text>
                {renderStoreItem(nearestStore)}
                
                {/* Only show geofencing button if location access available */}
                {hasLocationAccess && currentLocation && (
                  <TouchableOpacity 
                    style={styles.promoButton}
                    onPress={startStoreGeofencing}
                  >
                    <Text style={styles.promoButtonText}>
                      🔔 Aktifkan Notifikasi Promo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* All Stores */}
            <View style={styles.allStoresSection}>
              <Text style={styles.sectionTitle}>🏪 Semua Toko</Text>
              {stores.map(renderStoreItem)}
            </View>

            {/* Debug Actions - Only show if has location access */}
            {hasLocationAccess && (
              <View style={styles.debugSection}>
                <Text style={styles.debugTitle}>Debug Actions:</Text>
                
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={getCurrentLocation}
                >
                  <Text style={styles.debugButtonText}>🔄 Refresh Lokasi</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={sendAnalyticsLocation}
                >
                  <Text style={styles.debugButtonText}>📡 Kirim Data Analitik</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Info for users without location access */}
            {!hasLocationAccess && (
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>ℹ️ Informasi</Text>
                <Text style={styles.infoText}>
                  Izinkan akses lokasi untuk melihat toko terdekat dan mendapatkan notifikasi promo.
                </Text>
                <TouchableOpacity 
                  style={styles.settingsButton}
                  onPress={() => locationService.requestLocationPermission()}
                >
                  <Text style={styles.settingsButtonText}>Coba Izinkan Lagi</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  nearestStoreSection: {
    marginBottom: 24,
  },
  allStoresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  storeCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  storeDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  storeNoDistance: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  promoButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  promoButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  debugSection: {
    backgroundColor: '#e9ecef',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  debugButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 12,
    lineHeight: 20,
  },
  settingsButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default StoreLocatorScreen;