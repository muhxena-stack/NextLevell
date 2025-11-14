// src/screens/CheckoutScreen.tsx - PERBAIKAN type errors
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  TextInput
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Product } from '../types/types';
import { apiClient } from '../api/apiClient';

type CheckoutScreenRouteProp = RouteProp<{ Checkout: { product: Product } }, 'Checkout'>;

// ✅ Interface untuk form data
interface CheckoutForm {
  namaPenerima: string;
  alamat: string;
  telepon: string;
  kota: string;
  kodePos: string;
  catatan: string;
}

// ✅ PERBAIKAN: Definisikan semua field yang mungkin ada error
interface FieldErrors {
  namaPenerima?: string;
  alamat?: string;
  telepon?: string;
  kota?: string;
  kodePos?: string;
  catatan?: string; // ✅ Tambahkan catatan
}

// ✅ Type untuk field keys yang required
type RequiredField = 'namaPenerima' | 'alamat' | 'telepon' | 'kota' | 'kodePos';
type OptionalField = 'catatan';

const CheckoutScreen: React.FC = () => {
  const route = useRoute<CheckoutScreenRouteProp>();
  const navigation = useNavigation();
  const { product } = route.params;

  // ✅ State untuk form dan errors
  const [formData, setFormData] = useState<CheckoutForm>({
    namaPenerima: '',
    alamat: '',
    telepon: '',
    kota: '',
    kodePos: '',
    catatan: ''
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ PERBAIKAN: Type-safe input change handler
  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // ✅ PERBAIKAN: Type-safe error clearing
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // ✅ Validasi required fields
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
    } else if (!/^[0-9+\-\s()]+$/.test(formData.telepon)) {
      errors.telepon = 'Format telepon tidak valid';
    }

    if (!formData.kota.trim()) {
      errors.kota = 'Kota wajib diisi';
    }

    if (!formData.kodePos.trim()) {
      errors.kodePos = 'Kode pos wajib diisi';
    } else if (!/^\d+$/.test(formData.kodePos)) {
      errors.kodePos = 'Kode pos harus berupa angka';
    }

    // ✅ Catatan adalah optional, tidak perlu validasi required

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmCheckout = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Harap perbaiki kesalahan pada form sebelum melanjutkan');
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      // ✅ Simulasi POST request ke API
      const checkoutData = {
        productId: product.id,
        productName: product.nama,
        price: product.harga,
        shippingAddress: {
          namaPenerima: formData.namaPenerima,
          alamat: formData.alamat,
          telepon: formData.telepon,
          kota: formData.kota,
          kodePos: formData.kodePos
        },
        catatan: formData.catatan,
        total: product.harga + 15000
      };

      console.log('📦 Sending checkout data:', checkoutData);

      // ✅ Simulasi API call yang mungkin return 400 error
      const response = await apiClient.post('/carts/add', checkoutData);

      Alert.alert(
        'Checkout Berhasil!',
        `Pembelian ${product.nama} berhasil dilakukan`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Checkout error:', error);

      // ✅ Handle validation errors dari interceptor
      if (error.isValidationError && error.fieldErrors) {
        console.log('📋 Field errors received:', error.fieldErrors);
        setFieldErrors(error.fieldErrors);
        
        // Jangan tampilkan Alert - error sudah ditampilkan di field
        return;
      }

      // ✅ Handle other errors
      Alert.alert(
        'Checkout Gagal',
        error.message || 'Terjadi kesalahan saat memproses checkout. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // ✅ PERBAIKAN: Type-safe form field renderer
  const renderFormField = (
    label: string,
    field: keyof CheckoutForm,
    placeholder: string,
    multiline: boolean = false,
    required: boolean = true
  ) => {
    // ✅ PERBAIKAN: Type-safe error access
    const error = fieldErrors[field as keyof FieldErrors];
    
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.sectionTitle}>Produk</Text>
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

        {/* ✅ Form Pengiriman */}
        <View style={styles.shippingInfo}>
          <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>
          
          {renderFormField('Nama Penerima', 'namaPenerima', 'Masukkan nama lengkap penerima')}
          {renderFormField('Alamat Lengkap', 'alamat', 'Masukkan alamat lengkap pengiriman', true)}
          {renderFormField('Nomor Telepon', 'telepon', 'Contoh: 08123456789')}
          {renderFormField('Kota', 'kota', 'Masukkan kota')}
          {renderFormField('Kode Pos', 'kodePos', 'Contoh: 12345')}
          {renderFormField('Catatan', 'catatan', 'Catatan untuk kurir...', true, false)}
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.sectionTitle}>Pembayaran</Text>
          <Text style={styles.infoText}>Metode: Transfer Bank</Text>
          <Text style={styles.infoText}>Total: Rp {product.harga.toLocaleString('id-ID')}</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Ringkasan</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rp {product.harga.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ongkir</Text>
            <Text style={styles.summaryValue}>Rp 15.000</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rp {(product.harga + 15000).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.confirmButton, 
            isSubmitting && styles.disabledButton
          ]}
          onPress={handleConfirmCheckout}
          disabled={isSubmitting}
        >
          <Text style={styles.confirmButtonText}>
            {isSubmitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ✅ Tambahkan styles baru
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  productInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productText: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  shippingInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // ✅ Styles untuk form fields
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#DC3545',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#333',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#DC3545',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  paymentInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summary: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    padding: 16,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CheckoutScreen;