// src/components/AddProductModal.tsx - UPDATED WITH MULTI-IMAGE PICKER
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { Product, ProductImageAssets } from '../types/types';
import ProductImagePicker from './ProductImagePicker';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  onClose,
  onAddProduct
}) => {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Elektronik');
  const [urlGambar, setUrlGambar] = useState('');
  const [rating, setRating] = useState('4.0');
  const [terjual, setTerjual] = useState('0');
  
  // 🆕 NEW: State untuk multiple images
  const [productImages, setProductImages] = useState<ProductImageAssets[]>([]);

  const handleAddProduct = () => {
    if (!nama || !harga || !deskripsi) {
      Alert.alert('Error', 'Harap isi nama, harga, dan deskripsi produk');
      return;
    }

    // 🆕 NEW: Convert product images ke URLs
    const imageUrls = productImages.map(asset => asset.uri);
    
    const newProduct: Product = {
      id: Date.now(),
      nama,
      harga: parseInt(harga),
      deskripsi,
      kategori,
      urlGambar: urlGambar || imageUrls[0] || undefined, // Gunakan URL gambar pertama jika ada
      images: imageUrls.length > 0 ? imageUrls : undefined,
      imageAssets: productImages.length > 0 ? productImages : undefined,
      rating: parseFloat(rating),
      terjual: parseInt(terjual)
    };

    onAddProduct(newProduct);
    resetForm();
    onClose();
    Alert.alert('Sukses', 'Produk berhasil ditambahkan');
  };

  const resetForm = () => {
    setNama('');
    setHarga('');
    setDeskripsi('');
    setKategori('Elektronik');
    setUrlGambar('');
    setRating('4.0');
    setTerjual('0');
    // 🆕 NEW: Reset product images
    setProductImages([]);
  };

  // 🆕 NEW: Handle images selection
  const handleImagesSelected = (assets: ProductImageAssets[]) => {
    setProductImages(assets);
    console.log(`📸 ${assets.length} images selected for product`);
  };

  const categories = ['Elektronik', 'Otomotif', 'Bayi', 'Pakaian', 'Makanan'];

  // Preview gambar jika URL valid
  const showImagePreview = urlGambar && urlGambar.startsWith('http');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tambah Produk Baru</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Nama Produk *</Text>
          <TextInput
            style={styles.input}
            value={nama}
            onChangeText={setNama}
            placeholder="Masukkan nama produk"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Harga (Rp) *</Text>
          <TextInput
            style={styles.input}
            value={harga}
            onChangeText={setHarga}
            placeholder="Contoh: 500000"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          {/* 🆕 NEW: Product Image Picker */}
          <Text style={styles.label}>Gambar Produk</Text>
          <ProductImagePicker 
            onImagesSelected={handleImagesSelected}
            maxSelection={5}
          />

          <Text style={styles.label}>URL Gambar (Opsional)</Text>
          <TextInput
            style={styles.input}
            value={urlGambar}
            onChangeText={setUrlGambar}
            placeholder="https://example.com/gambar.jpg"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />

          {/* Preview Gambar */}
          {showImagePreview && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.previewLabel}>Preview Gambar URL:</Text>
              <Image 
                source={{ uri: urlGambar }} 
                style={styles.imagePreview}
                resizeMode="contain"
                onError={() => Alert.alert('Error', 'Gagal memuat gambar dari URL tersebut')}
              />
            </View>
          )}

          {/* 🆕 NEW: Preview Selected Images */}
          {productImages.length > 0 && (
            <View style={styles.selectedImagesContainer}>
              <Text style={styles.previewLabel}>
                Preview Gambar Terpilih ({productImages.length}):
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {productImages.map((asset, index) => (
                  <View key={asset.id} style={styles.selectedImageContainer}>
                    <Image 
                      source={{ uri: asset.uri }} 
                      style={styles.selectedImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.imageIndex}>{index + 1}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  kategori === cat && styles.categoryButtonActive
                ]}
                onPress={() => setKategori(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    kategori === cat && styles.categoryTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Rating</Text>
          <TextInput
            style={styles.input}
            value={rating}
            onChangeText={setRating}
            placeholder="4.0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Terjual</Text>
          <TextInput
            style={styles.input}
            value={terjual}
            onChangeText={setTerjual}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Deskripsi *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={deskripsi}
            onChangeText={setDeskripsi}
            placeholder="Masukkan deskripsi produk yang menarik..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />

          {/* 🆕 NEW: Form Summary */}
          <View style={styles.formSummary}>
            <Text style={styles.summaryTitle}>Ringkasan Produk:</Text>
            <Text style={styles.summaryText}>• {nama || 'Nama produk'}</Text>
            <Text style={styles.summaryText}>• Rp {harga || '0'}</Text>
            <Text style={styles.summaryText}>• {kategori}</Text>
            <Text style={styles.summaryText}>• {productImages.length} gambar terpilih</Text>
            <Text style={styles.summaryText}>• Rating: {rating}/5</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.addButton,
              (!nama || !harga || !deskripsi) && styles.addButtonDisabled
            ]}
            onPress={handleAddProduct}
            disabled={!nama || !harga || !deskripsi}
          >
            <Text style={styles.addButtonText}>
              Tambah Produk ({productImages.length} gambar)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    color: '#333',
  },
  textArea: {
    height: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  // 🆕 NEW: Selected Images Styles
  selectedImagesContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  selectedImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imageIndex: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  // 🆕 NEW: Form Summary Styles
  formSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#6C757D',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 2,
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddProductModal;