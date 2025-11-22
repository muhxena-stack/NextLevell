// src/components/ProductImagePicker.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useImagePicker } from '../hooks/useImagePicker';

interface ProductImagePickerProps {
  onImagesSelected?: (assets: any[]) => void;
  maxSelection?: number;
}

export const ProductImagePicker: React.FC<ProductImagePickerProps> = ({
  onImagesSelected,
  maxSelection = 5
}) => {
  const {
    productAssets,
    pickProductImages,
    clearProductImages,
    uploading,
    error
  } = useImagePicker();

  const handlePickImages = async () => {
    if (productAssets.length >= maxSelection) {
      Alert.alert(
        'Batas Maksimal',
        `Anda hanya dapat memilih maksimal ${maxSelection} gambar.`,
        [{ text: 'OK' }]
      );
      return;
    }

    await pickProductImages();
    
    if (onImagesSelected) {
      onImagesSelected(productAssets);
    }
  };

  const handleRemoveImage = (assetId: string) => {
    Alert.alert(
      'Hapus Gambar',
      'Apakah Anda yakin ingin menghapus gambar ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => {
            console.log('Remove image:', assetId);
          }
        }
      ]
    );
  };

  const remainingSlots = maxSelection - productAssets.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gambar Produk</Text>
        <Text style={styles.subtitle}>
          {productAssets.length}/{maxSelection} gambar terpilih
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {remainingSlots > 0 && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handlePickImages}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <>
                <Text style={styles.addButtonIcon}>+</Text>
                <Text style={styles.addButtonText}>Tambah</Text>
                <Text style={styles.addButtonSubtext}>
                  {remainingSlots} slot tersedia
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {productAssets.map((asset, index) => (
          <View key={asset.id} style={styles.imageContainer}>
            <Image 
              source={{ uri: asset.uri }} 
              style={styles.image}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveImage(asset.id)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.imageIndex}>{index + 1}</Text>
          </View>
        ))}
      </ScrollView>

      {productAssets.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearProductImages}
        >
          <Text style={styles.clearButtonText}>Hapus Semua Gambar</Text>
        </TouchableOpacity>
      )}

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.uploadingText}>Mengupload gambar...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffeaea',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  scrollView: {
    flexGrow: 0,
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  addButtonSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  imageIndex: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1976d2',
  },
});

export default ProductImagePicker;