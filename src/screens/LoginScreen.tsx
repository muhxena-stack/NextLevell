// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { RootStackParamList } from '../types/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { isOnline } = useNetworkStatus();
  const { login } = useAuth(); // Use AuthContext
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Tidak dapat login. Periksa koneksi internet.');
      return;
    }

    if (!credentials.username || !credentials.password) {
      Alert.alert('Error', 'Harap isi username dan password');
      return;
    }

    // Validasi panjang password
    if (credentials.password.length < 3) {
      Alert.alert('Error', 'Password harus minimal 3 karakter');
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Attempting login with:', {
        username: credentials.username,
        password: credentials.password
      });
      
      // Gunakan AuthContext login function
      const loginSuccess = await login(credentials.username, credentials.password);
      
      if (loginSuccess) {
        console.log('✅ Login successful, navigating to Main...');
        Alert.alert('Success', 'Login berhasil!', [
          {
            text: 'OK',
            onPress: () => {
              console.log('🚀 Navigating to Main screen...');
              navigation.replace('Main');
            }
          }
        ]);
      } else {
        console.log('❌ Login failed - returned false');
        Alert.alert('Error', 'Login gagal. Periksa username dan password Anda.');
      }
    } catch (error: any) {
      console.log('❌ Login error caught:', error);
      Alert.alert(
        'Login Gagal', 
        error.message || 'Terjadi kesalahan saat login. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle quick fill for demo
  const handleQuickFill = (username: string, password: string) => {
    setCredentials({
      username,
      password
    });
    console.log(`📝 Quick filled: ${username} / ${password}`);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Masuk ke akun Anda</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={credentials.username}
            onChangeText={(text) => handleInputChange('username', text)}
            autoCapitalize="none"
            placeholderTextColor="#999"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={credentials.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
            placeholderTextColor="#999"
            editable={!loading}
          />

          {!isOnline && (
            <View style={styles.offlineContainer}>
              <Text style={styles.offlineWarning}>📶 Anda sedang offline</Text>
              <Text style={styles.offlineSubtext}>Beberapa fitur mungkin tidak tersedia</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.loginButton,
              (!isOnline || loading) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={!isOnline || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>
                {!isOnline ? 'Menunggu Koneksi...' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Quick Fill Buttons */}
          <View style={styles.quickFillContainer}>
            <Text style={styles.quickFillTitle}>Quick Fill:</Text>
            <View style={styles.quickFillButtons}>
              <TouchableOpacity 
                style={styles.quickFillButton}
                onPress={() => handleQuickFill('admin', '123456')}
                disabled={loading}
              >
                <Text style={styles.quickFillText}>admin / 123456</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickFillButton}
                onPress={() => handleQuickFill('user', 'password')}
                disabled={loading}
              >
                <Text style={styles.quickFillText}>user / password</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickFillButton}
                onPress={() => handleQuickFill('test', 'test123')}
                disabled={loading}
              >
                <Text style={styles.quickFillText}>test / test123</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo credentials info */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Informasi Login:</Text>
            <Text style={styles.demoText}>
              • Gunakan credentials di atas untuk login cepat
            </Text>
            <Text style={styles.demoText}>
              • Sistem menggunakan simulasi login (selalu berhasil)
            </Text>
            <Text style={styles.demoText}>
              • Cek console untuk debug information
            </Text>
          </View>

          {/* Debug info */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>
              Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Text>
            <Text style={styles.debugText}>
              Loading: {loading ? '🔄 Yes' : '⚪ No'}
            </Text>
            <Text style={styles.debugText}>
              Username: {credentials.username || '(empty)'}
            </Text>
            <Text style={styles.debugText}>
              Password: {'*'.repeat(credentials.password.length) || '(empty)'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
    color: '#333',
  },
  offlineContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  offlineWarning: {
    color: '#856404',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  offlineSubtext: {
    color: '#856404',
    fontSize: 12,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickFillContainer: {
    marginBottom: 20,
  },
  quickFillTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  quickFillButtons: {
    gap: 8,
  },
  quickFillButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  quickFillText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  demoContainer: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 4,
    lineHeight: 16,
  },
  debugContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default LoginScreen;