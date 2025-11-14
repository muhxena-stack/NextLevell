// src/screens/ProductListScreen.tsx - PERBAIKAN NodeJS error
import React, { useState, useEffect, useRef } from 'react';
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
  
  // ✅ State untuk retry logic
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const [isPermanentError, setIsPermanentError] = useState(false);
  
  // ✅ PERBAIKAN: Gunany number | null instead of NodeJS.Timeout
  const retryTimeoutRef = useRef<number | null>(null);

  // ✅ Fungsi fetch dengan retry logic
  const fetchProducts = async (isRetry: boolean = false) => {
    // Validasi koneksi internet
    if (!isOnline || !isInternetReachable) {
      setError('Anda sedang Offline. Cek koneksi Anda.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const controller = new AbortController();
    
    // ✅ PERBAIKAN: Gunany number untuk timeout
    const timeoutId = setTimeout(() => controller.abort(), 7000) as unknown as number;

    try {
      setError(null);
      setIsPermanentError(false);
      
      const data = await productService.getProductsWithFetch(controller.signal);
      console.log('📦 Products loaded:', data.length);
      
      setProducts(data);
      setRetryCount(0); // Reset retry count pada success
      
    } catch (err: any) {
      if (err.message === 'Request cancelled') {
        console.log('✅ Request cancelled properly');
        return;
      }

      console.error(`❌ Fetch attempt ${retryCount + 1} failed:`, err.message);
      
      // ✅ Exponential Backoff Retry Logic
      if (retryCount < maxRetries - 1 && !isRetry) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`⏳ Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
        
        setError(`Gagal memuat produk. Mencoba lagi dalam ${delay/1000} detik...`);
        
        // ✅ PERBAIKAN: Gunany setTimeout dengan type number
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchProducts(true);
        }, delay) as unknown as number;
        
      } else {
        // ✅ Permanent error setelah max retries
        setIsPermanentError(true);
        setError('Gagal memuat produk setelah beberapa percobaan. Silakan coba lagi nanti.');
        Alert.alert(
          'Koneksi Bermasalah', 
          'Tidak dapat memuat data produk. Periksa koneksi internet Anda.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      clearTimeout(timeoutId);
      if (!isRetry) {
        setLoading(false);
        setRefreshing(false);
      }
    }

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadData = async () => {
      cleanup = await fetchProducts();
    };

    loadData();

    return () => {
      if (cleanup) cleanup();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [isOnline, isInternetReachable, retryCount]);

  const onRefresh = () => {
    setRefreshing(true);
    setRetryCount(0);
    setIsPermanentError(false);
    fetchProducts();
  };

  const handleManualRetry = () => {
    setLoading(true);
    setRetryCount(0);
    setIsPermanentError(false);
    setError(null);
    fetchProducts();
  };

  const handleProductPress = (product: ApiProduct) => {
    const convertedProduct = convertApiProductToProduct(product);
    navigation.navigate('ProductDetail', { product: convertedProduct });
  };

  const renderProductItem = ({ item }: { item: ApiProduct }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => handleProductPress(item)}
    >
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

  // ✅ Loading state dengan retry info
  if (loading && retryCount > 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          Memuat produk... (Percobaan {retryCount + 1}/{maxRetries})
        </Text>
        <Text style={styles.retryInfo}>
          Menunggu {Math.pow(2, retryCount)} detik sebelum mencoba lagi
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat produk...</Text>
      </View>
    );
  }

  // ✅ Permanent error state dengan manual retry button
  if (isPermanentError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>📶</Text>
        <Text style={styles.errorTitle}>{error}</Text>
        <Text style={styles.retryInfo}>
          Sudah mencoba {maxRetries} kali dengan exponential backoff
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleManualRetry}>
          <Text style={styles.retryText}>Coba Lagi Manual</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error && !isPermanentError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>📶</Text>
        <Text style={styles.errorTitle}>{error}</Text>
        <Text style={styles.retryInfo}>
          Percobaan {retryCount + 1}/{maxRetries}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleManualRetry}>
          <Text style={styles.retryText}>Coba Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Connection Type Display dengan retry info */}
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionText}>
          📶 Koneksi: {connectionType === 'wifi' ? 'WiFi' : 
                      connectionType === 'cellular' ? 'Cellular' : 
                      connectionType} • 
          Produk: {products.length} items
          {retryCount > 0 && ` • Retry: ${retryCount}/${maxRetries}`}
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
          <View>
            <Text style={styles.headerTitle}>Daftar Produk API ({products.length})</Text>
            {retryCount > 0 && (
              <Text style={styles.retryHeader}>
                🔄 Auto-retry: {retryCount}/{maxRetries} attempts
              </Text>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// ✅ Styles tetap sama
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
    marginBottom: 8,
    textAlign: 'center',
  },
  retryHeader: {
    fontSize: 12,
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
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
  retryInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
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