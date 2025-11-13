// src/screens/CartScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { cartService, Cart } from '../services/cartService';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Product } from '../types/types';

const CartScreen: React.FC = () => {
  const { isOnline, connectionType } = useNetworkStatus();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  
  // Ref untuk interval - FIXED: gunakan number bukan NodeJS.Timeout
  const pollingIntervalRef = useRef<number | null>(null);

  // Fetch cart data
  const fetchCartData = async () => {
    if (!isOnline) {
      console.log('📴 Skipping fetch - offline');
      return;
    }

    try {
      const cartData = await cartService.getCart(1); // Cart ID 1 untuk demo
      setCart(cartData);
      setPollingCount(prev => prev + 1);
      console.log(`🔄 Polling #${pollingCount + 1}: Cart updated`);
    } catch (error) {
      console.error('❌ Polling error:', error);
    }
  };

  // Setup polling dengan optimasi bandwidth (Soal e)
  useEffect(() => {
    // Hentikan polling jika connection type adalah cellular (Soal e)
    if (connectionType === 'cellular') {
      console.log('📵 Polling dihentikan - menggunakan jaringan cellular');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Hanya mulai polling jika online dan bukan cellular
    if (isOnline && connectionType !== 'cellular') {
      // Fetch data pertama kali
      fetchCartData();

      // Setup polling setiap 15 detik (Soal e) - FIXED: gunakan number
      pollingIntervalRef.current = setInterval(() => {
        fetchCartData();
      }, 15000) as unknown as number; // 15 detik

      console.log('✅ Polling dimulai - interval 15 detik');
    }

    // Cleanup function - sangat penting! (Soal e)
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('🧹 Polling dihentikan - cleanup');
      }
    };
  }, [isOnline, connectionType]); // Restart polling ketika koneksi berubah

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchCartData();
      setLoading(false);
    };

    loadInitialData();
  }, []);

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Text style={styles.productName}>{item.title}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        <Text style={styles.price}>${item.price} each</Text>
        <Text style={styles.total}>Total: ${item.total}</Text>
      </View>
      {item.discountPercentage > 0 && (
        <Text style={styles.discount}>
          Discount: {item.discountPercentage}% (Save: ${item.discountedPrice})
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memuat keranjang...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Polling Status */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          📡 Status: {isOnline ? 'Online' : 'Offline'} | 
          Jaringan: {connectionType} | 
          Polling: {connectionType === 'cellular' ? '❌ Diberhentikan' : '✅ Aktif'}
        </Text>
        <Text style={styles.pollingCount}>
          Update #{pollingCount} - {new Date().toLocaleTimeString()}
        </Text>
      </View>

      {!cart ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Keranjang kosong</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCartData}>
            <Text style={styles.retryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Text style={styles.header}>Keranjang Belanja</Text>
          
          <FlatList
            data={cart.products}
            renderItem={renderCartItem}
            keyExtractor={(item) => `${item.id}-${item.quantity}`}
            scrollEnabled={false}
          />

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Ringkasan Belanja</Text>
            <View style={styles.summaryRow}>
              <Text>Total Produk:</Text>
              <Text style={styles.summaryValue}>{cart.totalProducts}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Total Quantity:</Text>
              <Text style={styles.summaryValue}>{cart.totalQuantity}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Subtotal:</Text>
              <Text style={styles.summaryValue}>${cart.total}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Diskon:</Text>
              <Text style={styles.totalValue}>${cart.discountedTotal}</Text>
            </View>
          </View>

          {/* Polling Info */}
          <View style={styles.pollingInfo}>
            <Text style={styles.pollingInfoTitle}>Informasi Polling:</Text>
            <Text style={styles.pollingInfoText}>
              • Data diperbarui otomatis setiap 15 detik
            </Text>
            <Text style={styles.pollingInfoText}>
              • Polling dihentikan saat menggunakan jaringan cellular
            </Text>
            <Text style={styles.pollingInfoText}>
              • Terakhir update: {new Date().toLocaleTimeString()}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={() => Alert.alert('Checkout', 'Fitur checkout akan datang!')}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  statusBar: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  statusText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  pollingCount: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  cartItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 14,
    color: '#666',
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  discount: {
    fontSize: 12,
    color: '#28a745',
    fontStyle: 'italic',
  },
  summary: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
  pollingInfo: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  pollingInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  pollingInfoText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen;