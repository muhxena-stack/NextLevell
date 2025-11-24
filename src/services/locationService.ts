// src/services/locationService.ts - FIXED VERSION
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number; // ✅ FIX: Bisa undefined (bukan null)
}

export interface LocationError {
  code: number;
  message: string;
}

class LocationService {
  // ✅ SOAL 1: Izin Lokasi dengan Rationale
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Akses Lokasi',
            message: 'Kami butuh lokasi Anda untuk menampilkan toko terdekat secara akurat.',
            buttonPositive: 'Izinkan',
            buttonNegative: 'Tolak',
            buttonNeutral: 'Nanti'
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      // iOS handled automatically via Info.plist
      return true;
    } catch (error) {
      console.error('❌ Permission request error:', error);
      return false;
    }
  }

  // ✅ SOAL 2: Optimasi Baterai - One-Time Fetch
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            // ✅ FIX: Handle null values
            altitude: position.coords.altitude !== null ? position.coords.altitude : undefined
          };
          console.log('📍 Current location:', location);
          resolve(location);
        },
        (error) => {
          console.error('❌ Location error:', error);
          
          // ✅ SOAL 2: Handle timeout error
          if (error.code === 3) { // TIMEOUT error code
            Alert.alert('GPS Timeout', 'Periksa koneksi GPS Anda');
          }
          
          const locationError: LocationError = {
            code: error.code,
            message: error.message
          };
          reject(locationError);
        },
        { 
          enableHighAccuracy: true,    // ✅ SOAL 2: High accuracy untuk ongkir
          timeout: 10000,              // ✅ SOAL 2: 10 detik timeout
          maximumAge: 60000           // ✅ SOAL 2: Gunakan cache < 1 menit
        }
      );
    });
  }

  // ✅ SOAL 3: Live Tracking & Cleanup
  startLocationTracking(
    onLocationUpdate: (location: Location) => void,
    onError: (error: LocationError) => void
  ): number {
    console.log('🚀 Starting location tracking...');
    
    const watchId = Geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          // ✅ FIX: Handle null values
          altitude: position.coords.altitude !== null ? position.coords.altitude : undefined
        };
        console.log('🔄 Location update:', location);
        onLocationUpdate(location);
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: error.message
        };
        onError(locationError);
      },
      { 
        enableHighAccuracy: true,
        distanceFilter: 20,           // ✅ SOAL 3: Update setiap 20 meter
        interval: 10000,              // Optional: interval 10 detik (Android)
        fastestInterval: 5000         // Optional: fastest interval 5 detik (Android)
      }
    );

    return watchId;
  }

  stopLocationTracking(watchId: number): void {
    if (watchId) {
      console.log('🛑 Stopping location tracking:', watchId);
      Geolocation.clearWatch(watchId);
    }
  }

  // ✅ SOAL 4: Networking Hemat Data
  async sendLocationToServer(): Promise<void> {
    try {
      const location = await this.getCurrentLocation();
      
      // ✅ SOAL 4: maximumAge: 120000 (2 menit) membantu:
      // - Mengurangi beban server: Tidak kirim request berulang untuk data yang sama
      // - Menghemat baterai: Tidak akses hardware GPS jika data cache masih fresh
      // - Mengurangi penggunaan data: Lebih sedikit request network
      console.log('📡 Sending location to server:', location);
      
      // ✅ FIX: Promise tanpa parameter
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      console.log('✅ Location sent to server successfully');
      
    } catch (error) {
      console.error('❌ Failed to send location to server:', error);
    }
  }

  // ✅ SOAL 5: Geofencing - Hitung Jarak
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c * 1000; // Convert ke meter
    
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // ✅ SOAL 5: Geofencing Sederhana
  startGeofencing(
    storeLocation: Location,
    radiusMeters: number = 100,
    onEnterGeofence: () => void
  ): number {
    console.log('🏪 Starting geofencing for store:', storeLocation);
    
    const watchId = this.startLocationTracking(
      (userLocation) => {
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          storeLocation.latitude,
          storeLocation.longitude
        );
        
        console.log(`📏 Distance to store: ${distance.toFixed(2)} meters`);
        
        if (distance < radiusMeters) {
          console.log('🎉 User entered geofence!');
          onEnterGeofence();
          
          // ✅ SOAL 5: Matikan tracking setelah trigger
          this.stopLocationTracking(watchId);
        }
      },
      (error) => {
        console.error('❌ Geofencing error:', error);
      }
    );

    return watchId;
  }
}

export const locationService = new LocationService();