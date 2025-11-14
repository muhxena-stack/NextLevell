// src/screens/ProductDetailScreen.tsx - UPDATE dengan graceful degradation
import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, useWindowDimensions,
  Dimensions, Image, Alert, ActivityIndicator
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, ApiProduct } from '../types/types';
import { useCart } from '../context/CartContext';
import { HomeStackParamList } from '../navigation/HomeStack';
import {
  convertApiProductToProduct,
  isApiProduct,
  getProductName,
  getProductImage,
  getProductPrice,
  getProductDescription,
  getProductCategory,
  getProductRating,
  formatPrice
} from '../utils/productUtils';
import Toast from 'react-native-toast-message'; // ✅ Import Toast

type DetailScreenRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;

type ProductDetailScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ProductDetail'
>;

// ✅ Fallback data untuk graceful degradation
const FALLBACK_PRODUCT: Product = {
  id: -1,
  nama: 'Produk Tidak Tersedia',
  harga: 0,
  deskripsi: 'Maaf, data produk tidak dapat dimuat saat ini. Silakan coba lagi nanti.',
  kategori: 'Umum',
  urlGambar: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Gambar+Tidak+Tersedia',
  rating: 0,
  terjual: 0
};

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { addToCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>(FALLBACK_PRODUCT);

  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(width > height);

  // ✅ Effect untuk handle product data dengan error handling
  useEffect(() => {
    const initializeProduct = async () => {
      const rawProduct = route.params.product;
      
      try {
        setIsLoading(true);
        setHasError(false);

        // Simulasi API call failure untuk demo
        // Hapus kode ini di production
        const shouldFail = Math.random() < 0.3; // 30% chance untuk gagal (demo saja)
        if (shouldFail) {
          throw new Error('Simulated API failure');
        }

        const product = isApiProduct(rawProduct) 
          ? convertApiProductToProduct(rawProduct)
          : rawProduct as Product;

        setCurrentProduct(product);
        
      } catch (error: any) {
        console.error('❌ Error loading product:', error);
        
        // ✅ Log status code error terpisah
        if (error.response?.status === 404) {
          console.error('📋 Status Code 404: Product not found');
        } else if (error.response?.status === 500) {
          console.error('📋 Status Code 500: Internal server error');
        } else {
          console.error('📋 Network error:', error.message);
        }
        
        setHasError(true);
        setCurrentProduct(FALLBACK_PRODUCT);
        
        // ✅ Tampilkan Toast notification
        Toast.show({
          type: 'error',
          text1: 'Gagal memuat data terbaru',
          text2: 'Menampilkan versi arsip',
          position: 'bottom',
          visibilityTime: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeProduct();
  }, [route.params.product]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });

    return () => subscription?.remove();
  }, []);

  const handleResetStackAndCloseDrawer = () => {
    navigation.dispatch(StackActions.popToTop());
    const drawerParent = navigation.getParent()?.getParent();
    drawerParent?.dispatch({ type: 'CLOSE_DRAWER' });
    Alert.alert('Berhasil', 'Stack telah direset dan drawer ditutup');
  };

  const handleBackToDrawerHome = () => {
    const drawerParent = navigation.getParent()?.getParent();
    if (drawerParent) {
      drawerParent.goBack();
    } else {
      navigation.goBack();
    }
  };

  const handleAddToCart = () => {
    addToCart(currentProduct);
    Alert.alert('Berhasil!', `${currentProduct.nama} telah ditambahkan ke keranjang`);
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', { product: currentProduct });
  };

  // Get product details menggunakan currentProduct
  const productImage = getProductImage(currentProduct);
  const productName = getProductName(currentProduct);
  const productPrice = getProductPrice(currentProduct);
  const productDescription = getProductDescription(currentProduct);
  const productCategory = getProductCategory(currentProduct);
  const productRating = getProductRating(currentProduct);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat detail produk...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={[
        styles.scrollContent,
        isLandscape && styles.landscapeScrollContent
      ]}>
        {/* ✅ Error Indicator */}
        {hasError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              ⚠️ Menampilkan data cadangan
            </Text>
          </View>
        )}

        <View style={[
          styles.imageContainer,
          isLandscape && styles.landscapeImageContainer
        ]}>
          {productImage ? (
            <Image 
              source={{ uri: productImage }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>🖼️</Text>
              <Text style={styles.imageText}>Gambar Produk</Text>
            </View>
          )}
        </View>

        <View style={[
          styles.detailsContainer,
          isLandscape && styles.landscapeDetailsContainer
        ]}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{productCategory}</Text>
          </View>
          
          <Text style={styles.name}>{productName}</Text>
          <Text style={styles.price}>{formatPrice(productPrice)}</Text>
          
          <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
          <Text style={styles.descriptionText}>{productDescription}</Text>

          {productRating > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.sectionTitle}>Rating</Text>
              <Text style={styles.ratingText}>⭐ {productRating}/5</Text>
            </View>
          )}

          {currentProduct.terjual && currentProduct.terjual > 0 && (
            <View style={styles.soldContainer}>
              <Text style={styles.sectionTitle}>Terjual</Text>
              <Text style={styles.soldText}>{currentProduct.terjual} items</Text>
            </View>
          )}

          {/* Tampilkan info API hanya jika bukan fallback product */}
          {!hasError && isApiProduct(route.params.product) && (
            <View style={styles.apiInfoContainer}>
              <Text style={styles.sectionTitle}>Info Tambahan</Text>
              <View style={styles.apiInfoRow}>
                <Text style={styles.apiInfoLabel}>Brand:</Text>
                <Text style={styles.apiInfoValue}>{route.params.product.brand}</Text>
              </View>
              <View style={styles.apiInfoRow}>
                <Text style={styles.apiInfoLabel}>Stok:</Text>
                <Text style={styles.apiInfoValue}>{route.params.product.stock} units</Text>
              </View>
              {route.params.product.discountPercentage > 0 && (
                <View style={styles.apiInfoRow}>
                  <Text style={styles.apiInfoLabel}>Diskon:</Text>
                  <Text style={styles.discountText}>
                    {route.params.product.discountPercentage}% OFF
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.resetButton]}
              onPress={handleResetStackAndCloseDrawer}
            >
              <Text style={styles.actionButtonText}>🔄 Reset Stack & Tutup Drawer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.backButton]}
              onPress={handleBackToDrawerHome}
            >
              <Text style={styles.actionButtonText}>🏠 Kembali ke Drawer Home</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.checkoutButton]}
              onPress={handleCheckout}
            >
              <Text style={styles.actionButtonText}>💳 Checkout Sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            hasError && styles.disabledButton // ✅ Disable jika error
          ]}
          onPress={handleAddToCart}
          disabled={hasError}
        >
          <Text style={styles.addToCartText}>
            {hasError ? '⏸️ Tambah ke Keranjang (Sementara Dinonaktifkan)' : '+ Tambah ke Keranjang'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Toast Component */}
      <Toast />
    </SafeAreaView>
  );
};

// ✅ Tambahkan styles baru
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  errorBannerText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#6C757D',
    opacity: 0.7,
  },
  // ... (styles yang sudah ada sebelumnya tetap sama)
  scrollContent: { 
    padding: 25, 
    alignItems: 'flex-start', 
    paddingBottom: 100 
  },
  landscapeScrollContent: {
    flexDirection: 'row',
    padding: 15,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  landscapeImageContainer: {
    width: '40%',
    height: 400,
    marginRight: 20,
    marginBottom: 0,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 10,
    color: '#007AFF',
  },
  imageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
  },
  landscapeDetailsContainer: {
    width: '55%',
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  categoryText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  name: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#333' 
  },
  price: { 
    fontSize: 22, 
    color: '#FF4500', 
    fontWeight: '800', 
    marginBottom: 25 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginTop: 15, 
    marginBottom: 8, 
    color: '#555' 
  },
  descriptionText: { 
    fontSize: 16, 
    color: '#444', 
    textAlign: 'justify', 
    lineHeight: 24 
  },
  ratingContainer: {
    marginTop: 15,
  },
  ratingText: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: '600',
  },
  soldContainer: {
    marginTop: 10,
  },
  soldText: {
    fontSize: 16,
    color: '#666',
  },
  apiInfoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  apiInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  apiInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    fontSize: 14,
    color: '#FF4500',
    fontWeight: 'bold',
  },
  actionButtons: { 
    marginTop: 30, 
    marginBottom: 20 
  },
  actionButton: { 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  resetButton: { 
    backgroundColor: '#FF6B6B' 
  },
  backButton: { 
    backgroundColor: '#4ECDC4' 
  },
  checkoutButton: {
    backgroundColor: '#28a745'
  },
  actionButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  footer: {
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0,
    backgroundColor: 'white', 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0',
  },
  addToCartButton: {
    backgroundColor: '#FF4500', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    elevation: 3,
  },
  addToCartText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});

export default ProductDetailScreen;