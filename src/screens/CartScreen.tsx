// src/screens/CartScreen.tsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, 
  ActivityIndicator, ScrollView 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { deepLinkingService } from '../services/deepLinkingService';
import { CartItem as CartItemType } from '../types/types';

const CartItem: React.FC<{ 
  item: CartItemType; 
  onRemove: (productId: number) => void;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
}> = ({ item, onRemove, onUpdateQuantity }) => (
  <View style={styles.cartItem}>
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.product.nama}</Text>
      <Text style={styles.itemPrice}>Rp {item.product.harga.toLocaleString('id-ID')}</Text>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{item.quantity}</Text>
        
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.itemTotal}>
        Total: Rp {(item.product.harga * item.quantity).toLocaleString('id-ID')}
      </Text>
    </View>
    
    <TouchableOpacity 
      style={styles.removeButton}
      onPress={() => onRemove(item.product.id)}
    >
      <Text style={styles.removeButtonText}>🗑️</Text>
    </TouchableOpacity>
  </View>
);

const CartScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    cartItems, 
    removeFromCart, 
    getTotalPrice, 
    clearCart,
    updateCartItemQuantity // ✅ NOW THIS EXISTS
  } = useCart();
  const { user } = useAuth();
  
  const [deepLinkSource, setDeepLinkSource] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Tugas f: Handle Deep Link untuk Cart
  useEffect(() => {
    const unsubscribe = deepLinkingService.addListener((data) => {
      console.log('🛒 CartScreen received deep link:', data);
      
      if (data.route === 'cart') {
        setDeepLinkSource(`🔗 Dibuka via: ${data.url}`);
        
        if (data.params?.productAdded) {
          Alert.alert('Berhasil', 'Produk berhasil ditambahkan ke keranjang via deep link!');
        }
      }
    });

    // ✅ FIX: Safe navigation state check
    const checkDeepLinkSource = () => {
      try {
        const navigationState = navigation.getState();
        
        // ✅ FIX: Check if navigationState exists
        if (navigationState && navigationState.routes) {
          const isFromDeepLink = navigationState.routes.some(
            (route: any) => route.name === 'Cart' && !route.params
          );
          
          if (isFromDeepLink) {
            setDeepLinkSource('🔗 Dibuka via: ecommerceapp://cart');
          }
        }
      } catch (error) {
        console.warn('⚠️ Error checking navigation state:', error);
      }
    };

    checkDeepLinkSource();

    return unsubscribe;
  }, [navigation]);

  const handleRemoveItem = (productId: number) => {
    Alert.alert(
      'Hapus Item',
      'Yakin ingin menghapus item dari keranjang?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => removeFromCart(productId)
        }
      ]
    );
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateCartItemQuantity(productId, newQuantity); // ✅ NOW THIS WORKS
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan produk terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      Alert.alert(
        'Checkout Berhasil!',
        `Terima kasih ${user?.nama}! Pesanan Anda sedang diproses.\n\nTotal: Rp ${getTotalPrice().toLocaleString('id-ID')}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              clearCart();
              navigation.navigate('HomeTab' as never);
            }
          }
        ]
      );
      setIsProcessing(false);
    }, 1500);
  };

  const handleContinueShopping = () => {
    navigation.navigate('ProductsTab' as never);
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {deepLinkSource && (
          <View style={styles.deepLinkBanner}>
            <Text style={styles.deepLinkText}>{deepLinkSource}</Text>
          </View>
        )}
        
        <Text style={styles.emptyTitle}>🛒 Keranjang Kosong</Text>
        <Text style={styles.emptyText}>
          {deepLinkSource 
            ? 'Keranjang dibuka via deep link, tapi masih kosong' 
            : 'Belum ada produk di keranjang belanja Anda'
          }
        </Text>
        
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={handleContinueShopping}
        >
          <Text style={styles.shopButtonText}>🔍 Lihat Produk</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Deep Links:</Text>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => deepLinkingService.testDeepLink('ecommerceapp://cart')}
            >
              <Text style={styles.debugButtonText}>Test: ecommerceapp://cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {deepLinkSource && (
        <View style={styles.deepLinkBanner}>
          <Text style={styles.deepLinkText}>{deepLinkSource}</Text>
        </View>
      )}

      <Text style={styles.title}>🛒 Keranjang Belanja</Text>
      <Text style={styles.userGreeting}>Halo, {user?.nama}!</Text>
      
      <ScrollView style={styles.cartList}>
        <FlatList
          data={cartItems}
          renderItem={({ item }) => (
            <CartItem 
              item={item} 
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}
          keyExtractor={(item) => item.product.id.toString()}
          scrollEnabled={false}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Belanja:</Text>
          <Text style={styles.totalPrice}>
            Rp {getTotalPrice().toLocaleString('id-ID')}
          </Text>
        </View>
        
        <View style={styles.itemCount}>
          <Text style={styles.itemCountText}>
            {cartItems.length} item • {cartItems.reduce((sum, item) => sum + item.quantity, 0)} produk
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.clearButton, isProcessing && styles.buttonDisabled]}
            onPress={() => {
              Alert.alert(
                'Bersihkan Keranjang',
                'Yakin ingin menghapus semua item dari keranjang?',
                [
                  { text: 'Batal', style: 'cancel' },
                  { 
                    text: 'Hapus Semua', 
                    style: 'destructive',
                    onPress: clearCart
                  }
                ]
              );
            }}
            disabled={isProcessing}
          >
            <Text style={styles.clearButtonText}>🗑️ Hapus Semua</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.checkoutButton, isProcessing && styles.buttonDisabled]}
            onPress={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.checkoutButtonText}>
                💳 Checkout • Rp {getTotalPrice().toLocaleString('id-ID')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ✅ Tugas b: Wrap dengan Protected Route
const CartScreen: React.FC = () => {
  return (
    <ProtectedRoute>
      <CartScreenContent />
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20
  },
  deepLinkBanner: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
    margin: 16,
    borderRadius: 8,
  },
  deepLinkText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  debugContainer: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8
  },
  debugButton: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 6,
  },
  debugButtonText: {
    fontSize: 10,
    color: '#856404',
    textAlign: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
    textAlign: 'center'
  },
  userGreeting: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 10
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 16
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  itemPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center'
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745'
  },
  removeButton: {
    backgroundColor: '#ff4757',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  itemCount: {
    marginBottom: 16
  },
  itemCountText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.6
  }
});

export default CartScreen;