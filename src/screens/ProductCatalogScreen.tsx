import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  FlatList, 
  View, 
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getResponsiveCardWidth } from '../utils/responsive';
import ProductItem from '../components/ProductItem';
import AddProductModal from '../components/AddProductModal';
import { initialProducts } from '../data/initialProducts';
import { Product } from '../types/types';
import { HomeStackParamList } from '../navigation/HomeStack';

type ProductCatalogScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeTabs'>;

interface Props {
  filter?: string;
}

const ProductCatalogScreen: React.FC<Props> = ({ filter = 'all' }) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<ProductCatalogScreenNavigationProp>();
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
  let filtered = [...products];
  
  // FILTER BERDASARKAN KATEGORI YANG SESUAI
  switch (filter) {
    case 'Populer':
      filtered = products
        .filter(p => p.harga > 1000000)
        .sort((a, b) => b.harga - a.harga)
        .slice(0, 6);
      break;
      
    case 'Terbaru':
      filtered = products
        .sort((a, b) => b.id - a.id)
        .slice(0, 6);
      break;
      
    case 'Diskon':
      filtered = products.filter(p => p.harga < 1000000);
      break;
      
    case 'Elektronik':
      filtered = products.filter(p => p.kategori === 'Elektronik');
      break;
      
    case 'Otomotif':
      filtered = products.filter(p => p.kategori === 'Otomotif');
      break;
      
    case 'Bayi':
      filtered = products.filter(p => p.kategori === 'Bayi');
      break;
      
    case 'Pakaian':
      filtered = products.filter(p => p.kategori === 'Pakaian');
      break;
      
    case 'Makanan':
      filtered = products.filter(p => p.kategori === 'Makanan');
      break;
      
    default:
      filtered = products;
  }
  
  setFilteredProducts(filtered);
}, [filter, products]);

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  };

  const handleViewDetail = (product: Product) => {
    navigation.navigate('ProductDetail', { product: product });
  };
  
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
      <Text style={styles.headerText}>Katalog Produk - {filter}</Text>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAddModalVisible(true)} 
        >
            <Text style={styles.addButtonText}>➕ Tambah Produk</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={styles.list}
        numColumns={numColumns}
        key={numColumns.toString()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>Tidak ada produk di kategori ini</Text>
          </View>
        }
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});

export default ProductCatalogScreen;