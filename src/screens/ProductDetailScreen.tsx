// src/screens/ProductDetailScreen.tsx - ENHANCED FOR DEEP LINKING
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Product } from '../types/types';
import { useCart } from '../context/CartContext';

type ProductDetailRouteProp = RouteProp<{ ProductDetail: { id: string } }, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const { addToCart } = useCart();
  
  const { id } = route.params || {};
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deepLinkSource, setDeepLinkSource] = useState<string>('');

  // ✅ SOAL 2: Handle Product Deep Links
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);

        if (!id || id === '-1') {
          Alert.alert(
            'Product Tidak Valid',
            'ID produk tidak valid dari deep link',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }

        console.log('🛍️ Loading product from deep link, ID:', id);
        
        // Simulasi load product data
        const productId = parseInt(id, 10);
        const mockProduct: Product = {
          id: productId,
          nama: `Produk ${id} dari Deep Link`,
          harga: Math.floor(Math.random() * 500000) + 50000, // Random price
          deskripsi: `Ini adalah produk premium dengan ID ${id} yang dibuka melalui deep linking. Produk ini memiliki fitur-fitur terbaik dan kualitas terjamin.`,
          kategori: 'Elektronik',
          urlGambar: `https://picsum.photos/300/200?random=${productId}`,
          rating: Math.random() * 1 + 4, // 4-5 stars
          terjual: Math.floor(Math.random() * 1000) + 100
        };

        setProduct(mockProduct);
        setDeepLinkSource(`🔗 Dibuka via: ecommerceapp://product/${id}`);
        
      } catch (error) {
        console.error('❌ Error loading product:', error);
        Alert.alert(
          'Error', 
          'Gagal memuat produk',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id, navigation]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      Alert.alert('Berhasil', 'Produk ditambahkan ke keranjang!');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat produk...</Text>
        <Text style={styles.productId}>ID: {id}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Produk tidak ditemukan</Text>
        <Text style={styles.productId}>ID: {id}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ✅ Deep Link Info Banner */}
      {deepLinkSource && (
        <View style={styles.deepLinkBanner}>
          <Text style={styles.deepLinkText}>{deepLinkSource}</Text>
        </View>
      )}

      <Image source={{ uri: product.urlGambar }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.name}>{product.nama}</Text>
        <Text style={styles.price}>Rp {product.harga.toLocaleString('id-ID')}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {product.rating?.toFixed(1)}/5</Text>
          <Text style={styles.sold}>• Terjual: {product.terjual}</Text>
        </View>

        <Text style={styles.description}>{product.deskripsi}</Text>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>+ Tambah ke Keranjang</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20
  },
  loadingText: { fontSize: 16, color: '#666', marginBottom: 8 },
  errorText: { fontSize: 18, color: '#d32f2f', marginBottom: 12, textAlign: 'center' },
  productId: { fontSize: 14, color: '#999', fontFamily: 'monospace' },
  deepLinkBanner: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
    margin: 16,
    borderRadius: 8
  },
  deepLinkText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center'
  },
  image: { 
    width: '100%', 
    height: 300, 
    backgroundColor: '#f5f5f5'
  },
  content: { padding: 16 },
  name: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 8,
    color: '#333'
  },
  price: { 
    fontSize: 20, 
    color: '#007AFF', 
    marginBottom: 12,
    fontWeight: '600'
  },
  ratingContainer: { 
    flexDirection: 'row', 
    marginBottom: 16,
    alignItems: 'center'
  },
  rating: { fontSize: 14, color: '#ff9800', marginRight: 8 },
  sold: { fontSize: 14, color: '#666' },
  description: { 
    fontSize: 16, 
    lineHeight: 24, 
    color: '#555',
    marginBottom: 24
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  backButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 6,
    marginTop: 16
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14
  }
});

export default ProductDetailScreen;