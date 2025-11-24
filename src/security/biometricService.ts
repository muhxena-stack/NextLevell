// src/security/biometricService.ts - FINAL WORKING VERSION
import { 
  isSensorAvailable, 
  simplePrompt 
} from '@sbaiahmed1/react-native-biometrics';
import { Alert, Linking } from 'react-native';

class BiometricService {
  // ✅ FIX: Hanya menerima promptMessage string saja
  async promptBiometricAuthentication(promptMessage: string) {
    try {
      console.log('🔐 Starting biometric authentication...', promptMessage);
      
      // ✅ FIX: Hanya kirim promptMessage string
      const result = await simplePrompt(promptMessage);
      
      console.log('📊 Biometric auth result:', result);
      return { success: result.success, error: null };
    } catch (error: any) {
      console.error('❌ Biometric auth error:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Method untuk payment confirmation
  async confirmPayment(amount: number) {
    try {
      const promptMessage = `Konfirmasi Transfer Rp ${amount.toLocaleString('id-ID')}`;
      
      const result = await this.promptBiometricAuthentication(promptMessage);
      
      return result.success;
    } catch (error: any) {
      console.error('❌ Payment confirmation error:', error);
      return false;
    } 
  }

  // ✅ Method untuk login
  async loginWithBiometric() {
    try {
      const sensorInfo = await this.checkBiometricAvailability();
      
      if (!sensorInfo.available) {
        if (sensorInfo.error?.includes('not enrolled')) {
          Alert.alert(
            'Biometrik Belum DiatUR',
            'Silakan atur sidik jari/wajah di pengaturan perangkat.',
            [
              { text: 'Batal', style: 'cancel' },
              { 
                text: 'Buka Settings', 
                onPress: () => Linking.openSettings()
              }
            ]
          );
        } else {
          Alert.alert('Biometrik Tidak Tersedia', 'Sensor tidak tersedia.');
        }
        return false;
      }

      const biometryType = (sensorInfo as any).biometryType;
      
      let promptMessage = 'Login dengan Biometrik';
      if (biometryType === 'FaceID') {
        promptMessage = 'Pindai Wajah untuk Login';
      } else if (biometryType === 'TouchID') {
        promptMessage = 'Tempelkan Jari untuk Login';
      }

      const result = await this.promptBiometricAuthentication(promptMessage);
      
      return result.success;
    } catch (error: any) {
      console.error('❌ Biometric login error:', error);
      Alert.alert('Error', 'Gagal autentikasi biometrik');
      return false;
    }
  }

  // ✅ Method untuk cek ketersediaan
  async checkBiometricAvailability() {
    try {
      const result = await isSensorAvailable();
      console.log('🔐 Biometric check:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Biometric check error:', error);
      return { 
        available: false, 
        error: error?.message || 'Unknown error',
        biometryType: undefined 
      };
    }
  }

  // ✅ Method untuk AuthContext
  async getBiometricInfo() {
    const sensorInfo = await this.checkBiometricAvailability();
    return {
      supported: sensorInfo.available,
      type: (sensorInfo as any).biometryType || '',
      error: sensorInfo.error
    };
  }
}

export const biometricService = new BiometricService();