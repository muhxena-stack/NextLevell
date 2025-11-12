// src/screens/ProductDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, useWindowDimensions,
  Dimensions, Image
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product } from '../types/types';
import { useCart } from '../context/CartContext';
import { HomeStackParamList } from '../navigation/HomeStack';

// Define route prop types
type DetailScreenRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;

// Define navigation prop types
type ProductDetailScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ProductDetail'
>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { addToCart } = useCart();
  const product = route.params.product;
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(width > height);

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
    addToCart(product);
    Alert.alert('Berhasil!', `${product.nama} telah ditambahkan ke keranjang`);
  };

  const handleCheckout = () => {
    // Sekarang TypeScript tahu bahwa 'Checkout' ada di HomeStackParamList
    navigation.navigate('Checkout', { product });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={[
        styles.scrollContent,
        isLandscape && styles.landscapeScrollContent
      ]}>
        <View style={[
          styles.imageContainer,
          isLandscape && styles.landscapeImageContainer
        ]}>
          {product.urlGambar ? (
            <Image 
              source={{ uri: product.urlGambar }} 
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
            <Text style={styles.categoryText}>{product.kategori}</Text>
          </View>
          
          <Text style={styles.name}>{product.nama}</Text>
          <Text style={styles.price}>Rp {product.harga.toLocaleString('id-ID')}</Text>
          
          <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
          <Text style={styles.descriptionText}>{product.deskripsi}</Text>

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
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>+ Tambah ke Keranjang</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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