import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  FlatList, 
  View, 
  Button,
  useWindowDimensions, 
  TouchableOpacity,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 

import { getResponsiveCardWidth } from '../utils/responsive'; 
import ProductItem from '../components/ProductItem';
import AddProductModal from '../components/AddProductModal';
import { initialProducts } from '../data/initialProducts'; 
import { Product } from '../types/types'; 
import { HomeStackParamList } from '../navigation/HomeStack'; // Asumsi path: '../navigation/HomeStack'


type ProductCatalogScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Catalog'>;


const ProductCatalogScreen: React.FC = () => {
  const { width } = useWindowDimensions(); 
  const navigation = useNavigation<ProductCatalogScreenNavigationProp>(); // Hook Navigasi
// ... (lanjutkan dengan kode screen)

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prevProducts => [newProduct, ...prevProducts]); 
  };

  const handleViewDetail = (product: Product) => {
    // Pindah ke 'Detail' screen di dalam HomeStack
    navigation.navigate('Detail', { product: product });
  };
  
  // Logika Responsif
  const cardWidth = getResponsiveCardWidth(width);
  const numColumns = cardWidth === '100%' ? 1 : (cardWidth === '48%' ? 2 : 3);


  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductItem 
      product={item} 
      onPress={handleViewDetail} 
      itemWidth={cardWidth} 
    />
  );

  return (
    <View style={styles.container}>
      
      <Text style={styles.headerText}>Katalog Produk</Text>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAddModalVisible(true)} 
        >
            <Text style={styles.addButtonText}>➕ Tambah Produk ({numColumns} Kolom)</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={styles.list}
        numColumns={numColumns} 
        key={numColumns.toString()} 
      />

      <AddProductModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)} 
        onSubmit={handleAddProduct} 
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC', 
  },
  headerText: {
    fontSize: 22, 
    fontWeight: '700', 
    paddingVertical: 18,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    color: '#333',
  },
  list: {
    flexGrow: 1,
    padding: 5, 
    justifyContent: 'space-between', 
  },
  buttonWrapper: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addButton: {
      backgroundColor: '#4CAF50', 
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
  },
  addButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 14,
  }
});

export default ProductCatalogScreen;