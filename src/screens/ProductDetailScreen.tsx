import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Product } from '../types/types'; 

type DetailScreenRouteProp = RouteProp<{ Detail: { product: Product } }, 'Detail'>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const product = route.params.product; 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.name}>{product.nama}</Text>
        <Text style={styles.price}>
          Rp {product.harga.toLocaleString('id-ID')}
        </Text>
        <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
        <Text style={styles.descriptionText}>{product.deskripsi}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    scrollContent: { padding: 25, alignItems: 'flex-start' },
    name: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    price: { fontSize: 22, color: '#FF4500', fontWeight: '800', marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 8, color: '#555' },
    descriptionText: { fontSize: 16, color: '#444', textAlign: 'justify', lineHeight: 24 },
});

export default ProductDetailScreen;