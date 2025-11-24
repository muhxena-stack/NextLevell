// src/screens/CheckoutScreen.tsx - COMPLETE VERSION WITH LOCATION
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
  Alert, Image, TextInput, ActivityIndicator
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Product } from '../types/types';
import { RetryUtils } from '../utils/retryUtils';
import { biometricService } from '../security/biometricService';
import { locationService } from '../services/locationService';

type CheckoutScreenRouteProp = RouteProp<{ Checkout: { product?: Product } }, 'Checkout'>;

interface CheckoutForm {
  namaPenerima: string;
  alamat: string;
  telepon: string;
  kota: string;
  kodePos: string;
  catatan: string;
  metodePembayaran: string;
}

interface FieldErrors {
  namaPenerima?: string;
  alamat?: string;
  telepon?: string;
  kota?: string;
  kodePos?: string;
  catatan?: string;
  metodePembayaran?: string;
}

const CheckoutScreenContent: React.FC = () => {
  const route = useRoute<CheckoutScreenRouteProp>();
  const navigation = useNavigation();
  const { product } = route.params || {};
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, biometricSupported } = useAuth();
  
  const [formData, setFormData] = useState<CheckoutForm>({
    namaPenerima: user?.nama || '',
    alamat: '',
    telepon: '',
    kota: '',
    kodePos: '',
    catatan: '',
    metodePembayaran: 'transfer'
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  
  // ✅ SOAL 2: State untuk delivery cost berdasarkan lokasi
  const [deliveryCost, setDeliveryCost] = useState(15000);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);

  // Auto-fill user data
  useEffect(() => {
    const initializeForm = async () => {
      try {
        if (user) {
          setFormData(prev => ({
            ...prev,
            namaPenerima: user.nama || '',
            telepon: '08' + Math.random().toString().slice(2, 11)
          }));
        }

        // Check biometric availability for payment confirmation
        if (biometricSupported) {
          setShowBiometricOption(true);
        }

        // ✅ SOAL 2: Calculate delivery cost based on location
        await calculateDeliveryCost();

        await new Promise<void>((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing checkout:', error);
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [user, biometricSupported]);

  // ✅ SOAL 2: Calculate delivery cost based on location
  const calculateDeliveryCost = async () => {
    try {
      setIsCalculatingDelivery(true);
      console.log('📍 Calculating delivery cost based on location...');
      
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      
      // Simulasi perhitungan ongkir berdasarkan jarak
      const baseCost = 15000;
      
      // Dalam aplikasi nyata, ini akan menghitung jarak ke gudang/toko terdekat
      // Untuk demo, kita gunakan latitude sebagai faktor pengali
      const distanceMultiplier = 1 + (Math.abs(location.latitude) / 100);
      const calculatedCost = Math.min(baseCost * distanceMultiplier, 50000);
      
      // Bulatkan ke kelipatan 1000 terdekat
      const roundedCost = Math.round(calculatedCost / 1000) * 1000;
      setDeliveryCost(roundedCost);
      
      console.log('📦 Delivery cost calculated:', {
        baseCost,
        calculatedCost: roundedCost,
        userLocation: location
      });
      
    } catch (error: any) {
      console.error('❌ Delivery calculation error:', error);
      
      if (error.code === 3) { // TIMEOUT error
        Alert.alert(
          'GPS Timeout', 
          'Periksa koneksi GPS Anda. Menggunakan ongkir standar.',
          [{ text: 'OK' }]
        );
      }
      
      // Fallback to default cost
      setDeliveryCost(15000);
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!formData.namaPenerima.trim()) {
      errors.namaPenerima = 'Nama penerima wajib diisi';
    }

    if (!formData.alamat.trim()) {
      errors.alamat = 'Alamat wajib diisi';
    } else if (formData.alamat.trim().length < 10) {
      errors.alamat = 'Alamat terlalu pendek (minimal 10 karakter)';
    }

    if (!formData.telepon.trim()) {
      errors.telepon = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.telepon)) {
      errors.telepon = 'Format telepon tidak valid (10-15 angka)';
    }

    if (!formData.kota.trim()) {
      errors.kota = 'Kota wajib diisi';
    }

    if (!formData.kodePos.trim()) {
      errors.kodePos = 'Kode pos wajib diisi';
    } else if (!/^\d{5}$/.test(formData.kodePos)) {
      errors.kodePos = 'Kode pos harus 5 digit angka';
    }

    if (!formData.metodePembayaran) {
      errors.metodePembayaran = 'Pilih metode pembayaran';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBiometricPayment = async (totalAmount: number): Promise<boolean> => {
    try {
      const promptMessage = `Konfirmasi Transfer Rp ${totalAmount.toLocaleString('id-ID')}`;
      const success = await biometricService.confirmPayment(totalAmount);
      
      if (success) {
        console.log('✅ Biometric payment confirmation successful');
        return true;
      } else {
        console.log('❌ Biometric payment confirmation failed or canceled');
        Alert.alert('Dibatalkan', 'Transfer dibatalkan.');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Biometric payment error:', error);
      
      if (error.message === 'BIOMETRIC_LOCKOUT') {
        Alert.alert(
          'Biometrik Terkunci',
          'Terlalu banyak percobaan gagal. Silakan gunakan konfirmasi manual.'
        );
      } else {
        Alert.alert('Error', 'Verifikasi biometrik gagal. Silakan coba lagi.');
      }
      
      return false;
    }
  };

  const handleConfirmCheckout = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Harap perbaiki kesalahan pada form sebelum melanjutkan');
      return;
    }

    const totalAmount = getTotalPrice() + deliveryCost + (formData.metodePembayaran === 'cod' ? 5000 : 0);
    const requiresBiometric = totalAmount >= 500000;

    if (requiresBiometric && showBiometricOption) {
      const useBiometric = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Konfirmasi Keamanan',
          `Transfer sebesar Rp ${totalAmount.toLocaleString('id-ID')} memerlukan verifikasi biometrik untuk keamanan.`,
          [
            {
              text: 'Gunakan Password',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Verifikasi Biometrik',
              onPress: () => resolve(true)
            }
          ]
        );
      });

      if (useBiometric) {
        const biometricSuccess = await handleBiometricPayment(totalAmount);
        if (!biometricSuccess) {
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // ✅ SOAL 4: Kirim data lokasi ke server untuk analitik (hemat data)
      await locationService.sendLocationToServer();

      await RetryUtils.withRetry(async () => {
        console.log('📦 Processing checkout with retry logic...');
        
        const checkoutData = {
          userId: user?.id,
          items: product ? [product] : cartItems,
          shippingAddress: {
            namaPenerima: formData.namaPenerima,
            alamat: formData.alamat,
            telepon: formData.telepon,
            kota: formData.kota,
            kodePos: formData.kodePos
          },
          catatan: formData.catatan,
          metodePembayaran: formData.metodePembayaran,
          total: totalAmount,
          deliveryCost: deliveryCost,
          userLocation: userLocation, // ✅ Include location data
          timestamp: new Date().toISOString(),
          biometricConfirmed: requiresBiometric && showBiometricOption
        };

        console.log('💳 Checkout Data:', checkoutData);

        // Simulate API call with retry
        await new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < 0.2) {
              reject(new Error('Payment gateway timeout'));
            } else {
              resolve();
            }
          }, 2000);
        });

        return checkoutData;
      });

      // Success
      Alert.alert(
        'Checkout Berhasil! 🎉',
        `Pesanan Anda telah diterima.\n\nTotal: Rp ${totalAmount.toLocaleString('id-ID')}\nOngkir: Rp ${deliveryCost.toLocaleString('id-ID')}\n\nKode pesanan: #${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        [
          {
            text: 'Kembali ke Beranda',
            onPress: () => {
              if (!product) {
                clearCart();
              }
              navigation.navigate('HomeTab' as never);
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      Alert.alert('Checkout Gagal', error.message || 'Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Batalkan Checkout?',
      'Data yang sudah diisi akan hilang.',
      [
        { text: 'Lanjutkan Checkout', style: 'cancel' },
        { 
          text: 'Ya, Batalkan', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const renderFormField = (
    label: string,
    field: keyof CheckoutForm,
    placeholder: string,
    multiline: boolean = false,
    required: boolean = true
  ) => {
    const error = fieldErrors[field];
    
    return (
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>
          {label} {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            error && styles.inputError,
            multiline && styles.multilineInput
          ]}
          value={formData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={!isSubmitting}
        />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  const renderProductInfo = () => {
    if (product) {
      return (
        <View style={styles.productInfo}>
          <Text style={styles.sectionTitle}>Produk yang Dibeli</Text>
          <View style={styles.productDetail}>
            {product.urlGambar && (
              <Image 
                source={{ uri: product.urlGambar }} 
                style={styles.productImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.productText}>
              <Text style={styles.productName}>{product.nama}</Text>
              <Text style={styles.productCategory}>{product.kategori}</Text>
              <Text style={styles.productPrice}>Rp {product.harga.toLocaleString('id-ID')}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.cartInfo}>
        <Text style={styles.sectionTitle}>Keranjang Belanja</Text>
        {cartItems.map((item, index) => (
          <View key={item.product.id} style={styles.cartItem}>
            <Text style={styles.cartItemName}>
              {item.product.nama} × {item.quantity}
            </Text>
            <Text style={styles.cartItemPrice}>
              Rp {(item.product.harga * item.quantity).toLocaleString('id-ID')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Mempersiapkan checkout...</Text>
      </View>
    );
  }

  const totalAmount = getTotalPrice() + deliveryCost + (formData.metodePembayaran === 'cod' ? 5000 : 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💳 Checkout</Text>
        <Text style={styles.headerSubtitle}>Lengkapi data pengiriman</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProductInfo()}

        <View style={styles.shippingInfo}>
          <Text style={styles.sectionTitle}>📦 Informasi Pengiriman</Text>
          
          {renderFormField('Nama Penerima', 'namaPenerima', 'Masukkan nama lengkap penerima')}
          {renderFormField('Alamat Lengkap', 'alamat', 'Masukkan alamat lengkap pengiriman', true)}
          {renderFormField('Nomor Telepon', 'telepon', 'Contoh: 08123456789')}
          {renderFormField('Kota', 'kota', 'Masukkan kota')}
          {renderFormField('Kode Pos', 'kodePos', 'Contoh: 12345')}
          {renderFormField('Catatan', 'catatan', 'Catatan untuk kurir (opsional)...', true, false)}
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.sectionTitle}>💵 Metode Pembayaran</Text>
          
          <View style={styles.paymentOptions}>
            {['transfer', 'cod', 'credit_card'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentOption,
                  formData.metodePembayaran === method && styles.paymentOptionSelected
                ]}
                onPress={() => handleInputChange('metodePembayaran', method)}
                disabled={isSubmitting}
              >
                <Text style={[
                  styles.paymentOptionText,
                  formData.metodePembayaran === method && styles.paymentOptionTextSelected
                ]}>
                  {method === 'transfer' && '🏦 Transfer Bank'}
                  {method === 'cod' && '💵 Bayar di Tempat (COD)'}
                  {method === 'credit_card' && '💳 Kartu Kredit'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {fieldErrors.metodePembayaran && (
            <Text style={styles.errorText}>{fieldErrors.metodePembayaran}</Text>
          )}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>🧾 Ringkasan Pembayaran</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rp {getTotalPrice().toLocaleString('id-ID')}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Ongkos Kirim 
              {isCalculatingDelivery && (
                <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 8 }} />
              )}
            </Text>
            <Text style={styles.summaryValue}>
              Rp {deliveryCost.toLocaleString('id-ID')}
              {userLocation && (
                <Text style={styles.locationNote}> • Berdasarkan lokasi</Text>
              )}
            </Text>
          </View>
          
          {formData.metodePembayaran === 'cod' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Biaya COD</Text>
              <Text style={styles.summaryValue}>Rp 5.000</Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalValue}>
              Rp {totalAmount.toLocaleString('id-ID')}
            </Text>
          </View>

          {/* ✅ SOAL 2: Delivery Cost Information */}
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>ℹ️ Informasi Pengiriman</Text>
            <Text style={styles.deliveryText}>
              • Ongkir dihitung otomatis berdasarkan lokasi Anda
            </Text>
            <Text style={styles.deliveryText}>
              • Pengiriman 1-3 hari kerja
            </Text>
            <TouchableOpacity 
              style={styles.recalculateButton}
              onPress={calculateDeliveryCost}
              disabled={isCalculatingDelivery}
            >
              <Text style={styles.recalculateButtonText}>
                {isCalculatingDelivery ? 'Menghitung...' : '🔄 Hitung Ulang Ongkir'}
              </Text>
            </TouchableOpacity>
          </View>

          {showBiometricOption && totalAmount >= 500000 && (
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>🔒 Verifikasi Biometrik Diperlukan</Text>
              <Text style={styles.securityText}>
                • Transaksi di atas Rp 500.000 memerlukan verifikasi biometrik
              </Text>
            </View>
          )}
        </View>

        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugTitle}>🔧 Debug Info:</Text>
            <Text style={styles.debugText}>
              • Biometric: {biometricSupported ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              • Location: {userLocation ? 'Available' : 'Not available'}
            </Text>
            <Text style={styles.debugText}>
              • Delivery Cost: Rp {deliveryCost.toLocaleString('id-ID')}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>❌ Batal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.confirmButton, isSubmitting && styles.disabledButton]}
          onPress={handleConfirmCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>
              💰 Bayar Rp {totalAmount.toLocaleString('id-ID')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const CheckoutScreen: React.FC = () => {
  return (
    <ProtectedRoute>
      <CheckoutScreenContent />
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4
  },
  content: { flex: 1, padding: 16 },
  
  productInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productDetail: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  productText: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  productCategory: { 
    fontSize: 12, 
    color: '#007AFF', 
    backgroundColor: '#E3F2FD', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4, 
    alignSelf: 'flex-start',
    marginBottom: 8 
  },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF4500' },
  
  cartInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  cartItemName: { fontSize: 14, color: '#333', flex: 1 },
  cartItemPrice: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
  
  shippingInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  paymentInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentOptions: { marginTop: 8 },
  paymentOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8
  },
  paymentOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD'
  },
  paymentOptionText: { fontSize: 14, color: '#666' },
  paymentOptionTextSelected: { color: '#007AFF', fontWeight: '600' },
  
  summary: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // ✅ SOAL 2: Delivery Info Styles
  deliveryInfo: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 6,
  },
  deliveryText: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 2,
    lineHeight: 16,
  },
  recalculateButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  recalculateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  locationNote: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  
  securityInfo: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 6,
  },
  securityText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 2,
    lineHeight: 16,
  },
  
  debugInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6c757d'
  },
  debugTitle: { fontSize: 12, fontWeight: 'bold', color: '#495057', marginBottom: 4 },
  debugText: { fontSize: 10, color: '#495057' },
  
  formField: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  requiredStar: { color: '#DC3545' },
  textInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12,
    fontSize: 16, backgroundColor: '#F8F9FA', color: '#333',
  },
  multilineInput: { height: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#DC3545', backgroundColor: '#FFF5F5' },
  errorText: { color: '#DC3545', fontSize: 12, marginTop: 4, marginLeft: 4 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 12 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' }, 
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#333' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 12, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  
  footer: {
    flexDirection: 'row', padding: 16, backgroundColor: 'white',
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1, padding: 16, backgroundColor: '#6c757d', borderRadius: 8,
    alignItems: 'center', marginRight: 10,
  },
  cancelButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  confirmButton: {
    flex: 2, padding: 16, backgroundColor: '#28a745', borderRadius: 8,
    alignItems: 'center', marginLeft: 10,
  },
  confirmButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
});

export default CheckoutScreen;