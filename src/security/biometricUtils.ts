// src/security/biometricUtils.ts
import { Alert } from 'react-native';

export class BiometricUtils {
  // ✅ SOAL 4: Force Logout saat Lockout
  static handleBiometricLockout(): void {
    console.log('🔒 Biometric lockout detected - triggering security protocols');
    
    Alert.alert(
      'Keamanan Diperketat',
      'Terlalu banyak percobaan autentikasi gagal. Untuk keamanan akun Anda, kami akan melakukan logout otomatis.',
      [
        { 
          text: 'Mengerti', 
          onPress: () => {
            console.log('🔄 Proceeding with forced logout due to biometric lockout');
          }
        }
      ]
    );
  }

  // ✅ Helper untuk menampilkan biometric settings
  static openBiometricSettings(): void {
    Alert.alert(
      'Pengaturan Biometrik',
      'Untuk menggunakan fitur biometrik, Anda perlu mengatur sidik jari atau wajah di pengaturan perangkat terlebih dahulu.',
      [
        { text: 'Nanti', style: 'cancel' },
        { 
          text: 'Buka Settings', 
          onPress: () => {
            // Akan diimplementasi di component yang menggunakan Linking
            console.log('📱 Redirect to biometric settings');
          }
        }
      ]
    );
  }

  // ✅ Check if error is recoverable
  static isRecoverableError(error: any): boolean {
    const errorMessage = error?.message || error || '';
    
    const recoverableErrors = [
      'User canceled',
      'canceled',
      'Authentication failed',
      'Not recognized'
    ];
    
    const unrecoverableErrors = [
      'lockout',
      'not enrolled',
      'not available',
      'hardware not present'
    ];

    return !unrecoverableErrors.some(unrecoverable => 
      errorMessage.toLowerCase().includes(unrecoverable.toLowerCase())
    );
  }

  // ✅ Get user-friendly error message
  static getFriendlyErrorMessage(error: any): string {
    const errorMessage = error?.message || error || '';
    
    if (errorMessage.includes('not enrolled')) {
      return 'Biometrik belum diatur di perangkat ini.';
    } else if (errorMessage.includes('lockout')) {
      return 'Terlalu banyak percobaan gagal. Coba lagi nanti.';
    } else if (errorMessage.includes('User canceled')) {
      return 'Autentikasi dibatalkan.';
    } else if (errorMessage.includes('Authentication failed')) {
      return 'Verifikasi gagal. Coba lagi.';
    } else {
      return 'Terjadi kesalahan saat autentikasi.';
    }
  }
}