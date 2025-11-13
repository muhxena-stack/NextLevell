// src/screens/ProductListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { productService } from '../services/productService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { ApiProduct } from '../types/types';
import { HomeStackParamList } from '../navigation/HomeStack';
import { convertApiProductToProduct, formatApiPrice } from '../utils/productUtils';

type ProductListScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<ProductListScreenNavigationProp>();
  const { isOnline, isInternetReachable, connectionType } = useNetworkStatus();
  
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products dengan Fetch API + AbortController (Soal a)
  const fetchProducts = async () => {
    // Validasi koneksi internet (Soal b)
    if (!isOnline || !isInternetReachable) {
      setError('Anda sedang Offline. Cek koneksi Anda.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 detik timeout (Soal a)

    try {
      setError(null);
      const data = await productService.getProductsWithFetch(controller.signal);
      console.log('📦 Products loaded:', data.length);
      if (data.length > 0) {
        console.log('🖼️ First product image:', data[0].thumbnail);
      }
      setProducts(data);
    } catch (err: any) {
      if (err.message === 'Request cancelled') {
        console.log('✅ Request cancelled properly');
      } else {
        setError(err.message || 'Gagal memuat produk');
        Alert.alert('Error', 'Gagal memuat data produk');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setRefreshing(false);
    }

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadData = async () => {
      cleanup = await fetchProducts();
    };

    loadData();

    // Cleanup function (Soal a)
    return () => {
      if (cleanup) cleanup();
    };
  }, [isOnline, isInternetReachable]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (product: ApiProduct) => {
    // Convert ApiProduct to Product sebelum navigate ke detail screen
    const convertedProduct = convertApiProductToProduct(product);
    navigation.navigate('ProductDetail', { product: convertedProduct });
  };

  const renderProductItem = ({ item }: { item: ApiProduct }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => handleProductPress(item)}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {item.thumbnail ? (
          <Image 
            source={{ uri: item.thumbnail }} 
            style={styles.productImage}
            resizeMode="cover"
            onError={(e) => console.log('❌ Image load error:', e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>🖼️</Text>
            <Text style={styles.placeholderSubtext}>No Image</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.productPrice}>{formatApiPrice(item.price)}</Text>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.productRating}>⭐ {item.rating}</Text>
          <Text style={styles.productStock}>• Stock: {item.stock}</Text>
        </View>

        <Text style={styles.productBrand} numberOfLines={1}>
          Brand: {item.brand}
        </Text>

        {item.discountPercentage > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.productDiscount}>
              🔥 {item.discountPercentage}% OFF
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat produk...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>📶</Text>
        <Text style={styles.errorTitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Connection Type Display (Soal b) */}
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionText}>
          📶 Koneksi: {connectionType === 'wifi' ? 'WiFi' : 
                      connectionType === 'cellular' ? 'Cellular' : 
                      connectionType} • 
          Produk: {products.length} items
        </Text>
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Daftar Produk API ({products.length})</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectionInfo: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  connectionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  productItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#007AFF',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 10,
    color: '#007AFF',
  },
  productDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4500',
    marginBottom: 6,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  productCategory: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productRating: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  productBrand: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  discountContainer: {
    alignSelf: 'flex-start',
  },
  productDiscount: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: '600',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductListScreen;