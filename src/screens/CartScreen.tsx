// src/screens/CartScreen.tsx - FIXED VERSION
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types/types';

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, removeFromCart, getTotalPrice, clearCart } = useCart();
  
  const [deepLinkSource, setDeepLinkSource] = useState<string>('');

  // ✅ SOAL 3: Handle Cart Deep Links (Warm Start) - FIXED undefined checks
  useEffect(() => {
    try {
      // ✅ FIX: Safe navigation state check
      const navigationState = navigation.getState();
      if (navigationState && navigationState.routes) {
        const isFromDeepLink = navigationState.routes.some(
          (route: any) => route.name === 'Cart' && !route.params
        );
        
        if (isFromDeepLink) {
          setDeepLinkSource('🔗 Dibuka via: ecommerceapp://cart');
          console.log('🛒 Cart opened via deep link');
        }
      }
    } catch (error) {
      console.warn('⚠️ Error checking navigation state:', error);
    }
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

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan produk terlebih dahulu');
      return;
    }

    Alert.alert(
      'Checkout',
      `Total: Rp ${getTotalPrice().toLocaleString('id-ID')}\nLanjutkan checkout?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Checkout', 
          onPress: () => {
            // Navigate to checkout screen
            Alert.alert('Success', 'Checkout berhasil!');
            clearCart();
          }
        }
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.nama}</Text>
        <Text style={styles.itemPrice}>Rp {item.product.harga.toLocaleString('id-ID')}</Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.product.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

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
            : 'Belum ada produk di keranjang'
          }
        </Text>
        
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text style={styles.shopButtonText}>Belanja Sekarang</Text>
        </TouchableOpacity>
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

      <Text style={styles.title}>Keranjang Belanja</Text>
      
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product.id.toString()}
        style={styles.cartList}
        contentContainerStyle={styles.cartListContent}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>
            Rp {getTotalPrice().toLocaleString('id-ID')}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                'Bersihkan Keranjang',
                'Yakin ingin menghapus semua item?',
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
          >
            <Text style={styles.clearButtonText}>Hapus Semua</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
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
    width: '100%'
  },
  deepLinkText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#333'
  },
  cartList: {
    flex: 1
  },
  cartListContent: {
    padding: 16
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  itemPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666'
  },
  removeButton: {
    backgroundColor: '#ff4757',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ff4757',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default CartScreen;