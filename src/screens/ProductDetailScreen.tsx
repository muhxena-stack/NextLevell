import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert 
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { Product } from '../types/types';
import { useCart } from '../context/CartContext';

type DetailScreenRouteProp = RouteProp<{ ProductDetail: { product: Product } }, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const product = route.params.product;

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.name}>{product.nama}</Text>
        <Text style={styles.price}>Rp {product.harga.toLocaleString('id-ID')}</Text>
        
        <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
        <Text style={styles.descriptionText}>{product.deskripsi}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleResetStackAndCloseDrawer}
          >
            <Text style={styles.actionButtonText}>Reset Stack & Tutup Drawer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.backButton]}
            onPress={handleBackToDrawerHome}
          >
            <Text style={styles.actionButtonText}>Kembali ke Drawer Home</Text>
          </TouchableOpacity>
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
  scrollContent: { padding: 25, alignItems: 'flex-start', paddingBottom: 100 },
  name: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  price: { fontSize: 22, color: '#FF4500', fontWeight: '800', marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 8, color: '#555' },
  descriptionText: { fontSize: 16, color: '#444', textAlign: 'justify', lineHeight: 24 },
  actionButtons: { marginTop: 30, marginBottom: 20 },
  actionButton: { padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  resetButton: { backgroundColor: '#FF6B6B' },
  backButton: { backgroundColor: '#4ECDC4' },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#E0E0E0',
  },
  addToCartButton: {
    backgroundColor: '#FF4500', padding: 16, borderRadius: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3,
  },
  addToCartText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ProductDetailScreen;