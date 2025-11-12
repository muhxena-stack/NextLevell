// src/screens/ProductCatalogScreen.tsx (alternatif lebih clean)
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  FlatList, 
  View, 
  TouchableOpacity,
  useWindowDimensions,
  Dimensions
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { getResponsiveCardWidth } from '../utils/responsive';
import ProductItem from '../components/ProductItem';
import AddProductModal from '../components/AddProductModal';
import { initialProducts } from '../data/initialProducts';
import { Product } from '../types/types';
import { HomeStackParamList } from '../navigation/HomeStack';

type ProductCatalogScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeTabs'>;

interface RouteParams {
  filter?: string;
}

const ProductCatalogScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation<ProductCatalogScreenNavigationProp>();
  const route = useRoute();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLandscape, setIsLandscape] = useState(width > height);

  const routeParams = route.params as RouteParams;
  const filter = routeParams?.filter || 'all';

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });

    return () => subscription?.remove();
  }, []);

  // Tugas 7: Dynamic Header Title
  useFocusEffect(
    React.useCallback(() => {
      if (filter === 'Populer') {
        navigation.getParent()?.setOptions({
          title: 'Product ter Populer!'
        });
      }

      return () => {
        navigation.getParent()?.setOptions({
          title: 'Katalog Produk'
        });
      };
    }, [filter, navigation])
  );

  // Tugas 9: Toggle Drawer dari Child
  const handleToggleDrawer = () => {
    const drawerParent = navigation.getParent()?.getParent();
    const drawerNavigation = drawerParent as DrawerNavigationProp<any> | null;
    
    if (drawerNavigation && 'toggleDrawer' in drawerNavigation) {
      drawerNavigation.toggleDrawer();
    }
  };

  useEffect(() => {
    let filtered = [...products];
    
    switch (filter) {
      case 'Populer':
        filtered = products
          .filter(p => (p.rating || 0) >= 4.5)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        break;
      case 'Terbaru':
        filtered = products
          .sort((a, b) => b.id - a.id)
          .slice(0, 6);
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
  const numColumns = isLandscape ? 
    (cardWidth === '100%' ? 2 : (cardWidth === '48%' ? 3 : 4)) :
    (cardWidth === '100%' ? 1 : (cardWidth === '48%' ? 2 : 3));

  const renderProductItem = ({ item }: { item: Product }) => (
    <ProductItem 
      product={item} 
      onPress={handleViewDetail} 
      itemWidth={cardWidth} 
    />
  );

  const getProductCountText = () => {
    switch (filter) {
      case 'Elektronik':
        return `(${filteredProducts.length} produk elektronik)`;
      case 'Otomotif':
        return `(${filteredProducts.length} produk otomotif)`;
      case 'Bayi':
        return `(${filteredProducts.length} produk bayi)`;
      case 'Pakaian':
        return `(${filteredProducts.length} produk pakaian)`;
      case 'Makanan':
        return `(${filteredProducts.length} produk makanan)`;
      case 'Populer':
        return `(${filteredProducts.length} produk pilihan)`;
      case 'Terbaru':
        return `(${filteredProducts.length} produk terbaru)`;
      default:
        return `(${filteredProducts.length} total produk)`;
    }
  };

  const getHeaderTitle = () => {
    switch (filter) {
      case 'all':
        return 'Semua Produk';
      case 'Populer':
        return 'Produk Populer';
      case 'Terbaru':
        return 'Produk Terbaru';
      case 'Elektronik':
        return 'Elektronik';
      case 'Otomotif':
        return 'Otomotif';
      case 'Bayi':
        return 'Produk Bayi';
      case 'Pakaian':
        return 'Pakaian';
      case 'Makanan':
        return 'Makanan';
      default:
        return 'Katalog Produk';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{getHeaderTitle()}</Text>
        <Text style={styles.productCount}>{getProductCountText()}</Text>
        
        {/* Tombol toggle drawer yang minimalis di header */}
        {filter === 'Populer' && (
          <TouchableOpacity 
            style={styles.headerToggleButton}
            onPress={handleToggleDrawer}
          >
            <Text style={styles.headerToggleText}>☰</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>📦</Text>
          <Text style={styles.emptyStateTitle}>Tidak ada produk</Text>
          <Text style={styles.emptyStateSubtitle}>
            {filter === 'all' 
              ? 'Belum ada produk yang tersedia' 
              : `Tidak ada produk dalam kategori ${filter}`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          key={numColumns}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Tambah Produk</Text>
      </TouchableOpacity>

      <AddProductModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddProduct={handleAddProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative', // Untuk positioning tombol toggle
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  productCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerToggleButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'transparent',
    padding: 8,
  },
  headerToggleText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductCatalogScreen;