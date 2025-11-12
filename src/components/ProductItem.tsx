// src/components/ProductItem.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  Dimensions,
  Image,
  DimensionValue 
} from 'react-native';
import { Product } from '../types/types';

interface ProductItemProps {
  product: Product;
  onPress: (product: Product) => void;
  itemWidth: DimensionValue;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress, itemWidth }) => {
  const { width } = Dimensions.get('window');
  const isLandscape = width > Dimensions.get('window').height;

  const containerStyle = {
    width: itemWidth,
    ...styles.container,
    ...(isLandscape && styles.landscapeContainer)
  };

  return (
    <TouchableOpacity 
      style={containerStyle}
      onPress={() => onPress(product)}
    >
      <View style={styles.imageContainer}>
        {product.urlGambar ? (
          <Image 
            source={{ uri: product.urlGambar }} 
            style={styles.productImage}
            resizeMode="contain" // Ubah dari "cover" ke "contain" agar gambar utuh
            onError={(error) => console.log('Error loading image:', error.nativeEvent.error)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
      </View>
      
      <View style={styles.details}>
        <Text 
          style={styles.name} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.nama}
        </Text>
        
        <Text style={styles.category}>{product.kategori}</Text>
        
        <Text style={styles.price}>
          Rp {product.harga.toLocaleString('id-ID')}
        </Text>
        
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {product.rating}</Text>
            {product.terjual && (
              <Text style={styles.sold}>• Terjual {product.terjual}</Text>
            )}
          </View>
        )}
        
        <Text 
          style={styles.description}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.deskripsi}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 6,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 320,
  },
  landscapeContainer: {
    minHeight: 350,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'center', // Center the image
    alignItems: 'center', // Center the image
  },
  productImage: {
    width: '100%',
    height: '100%',
    // Gambar akan menyesuaikan container tanpa terpotong
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#007AFF',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  sold: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default ProductItem;