import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  ViewStyle, 
  ImageStyle 
} from 'react-native'; 
import { Product } from '../types/types'; 

interface ProductItemProps {
  product: Product;
  onPress: (product: Product) => void; 
  itemWidth: string; // Tipe string untuk persentase lebar
  // Hapus: onAddToCart: (product: Product) => void; 
}

// Hapus prop onAddToCart dari parameter
const ProductItem: React.FC<ProductItemProps> = ({ product, onPress, itemWidth }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { width: itemWidth } as ViewStyle]} 
      onPress={() => onPress(product)} 
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: product.urlGambar }} 
          style={styles.image} 
          resizeMode="contain" // ⬅️ KUNCI: Gambar utuh, tidak terpotong
        />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {product.nama}
        </Text>
        <Text style={styles.price}>
          Rp {product.harga.toLocaleString('id-ID')}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.deskripsi}
        </Text>
        
        {/* Hapus Tombol Tambah ke Keranjang */}
        
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 15, 
    margin: 5, 
    backgroundColor: '#FFFFFF',
    borderRadius: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, 
    flexDirection: 'column',
    alignItems: 'flex-start',
  } as ViewStyle, 
  
  imageWrapper: {
      width: '100%',
      height: 180, // Tinggi yang cukup untuk gambar utuh
      marginBottom: 12,
      flexDirection: 'column', 
      alignItems: 'center', // Pusatkan gambar
      justifyContent: 'center',
  } as ViewStyle, 

  image: {
    width: '100%', 
    height: '100%', 
    borderRadius: 8,
    backgroundColor: '#EAEAEA',
  } as ImageStyle, 

  details: {
    justifyContent: 'space-between', 
    width: '100%',
  } as ViewStyle,

  name: {
    fontSize: 16, 
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#FF4500', 
    fontWeight: '700',
    marginBottom: 8, 
  },
  description: {
    fontSize: 12,
    color: '#777',
    marginBottom: 0, // Hapus margin bawah yang tadinya untuk tombol
  },
  
  // Hapus Styles untuk addButton dan addButtonText
});

export default ProductItem;