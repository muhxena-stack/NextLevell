// src/components/AddProductModal.tsx
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
import { Product } from '../types/types';

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

  const handleAddProduct = () => {
    if (!nama || !harga || !deskripsi) {
      Alert.alert('Error', 'Harap isi nama, harga, dan deskripsi produk');
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      nama,
      harga: parseInt(harga),
      deskripsi,
      kategori,
      urlGambar: urlGambar || undefined,
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

          <Text style={styles.label}>URL Gambar</Text>
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
              <Text style={styles.previewLabel}>Preview Gambar:</Text>
              <Image 
                source={{ uri: urlGambar }} 
                style={styles.imagePreview}
                resizeMode="contain"
                onError={() => Alert.alert('Error', 'Gagal memuat gambar dari URL tersebut')}
              />
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
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddProduct}
          >
            <Text style={styles.addButtonText}>Tambah Produk</Text>
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
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
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
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddProductModal;