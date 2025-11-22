// src/components/ImagePickerModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { useImagePicker } from '../hooks/useImagePicker';
import { imageStorage } from '../storage/imageStorage';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (asset: any) => void;
  title?: string;
  includeBase64?: boolean;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = 'Pilih Gambar',
  includeBase64 = false
}) => {
  const { pickAvatar, takeAvatarPhoto, error, clearError } = useImagePicker();

  const handleCameraPress = async () => {
    try {
      const asset = await takeAvatarPhoto();
      if (asset) {
        onImageSelected(asset);
        onClose();
      }
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleGalleryPress = async () => {
    try {
      const asset = await pickAvatar();
      if (asset) {
        onImageSelected(asset);
        onClose();
      }
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview Cepat:</Text>
            <QuickAvatarPreview />
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleCameraPress}
            >
              <Text style={styles.optionIcon}>📸</Text>
              <Text style={styles.optionText}>Kamera</Text>
              <Text style={styles.optionSubtext}>Ambil foto baru</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleGalleryPress}
            >
              <Text style={styles.optionIcon}>🖼️</Text>
              <Text style={styles.optionText}>Galeri</Text>
              <Text style={styles.optionSubtext}>Pilih dari galeri</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              ✅ Gambar akan dikompresi untuk performa terbaik
            </Text>
            <Text style={styles.infoText}>
              ✅ Preview tersedia offline berkat Base64
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const QuickAvatarPreview: React.FC = () => {
  const [base64Avatar, setBase64Avatar] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadBase64Avatar = async () => {
      const base64 = await imageStorage.getAvatarBase64();
      setBase64Avatar(base64);
    };

    loadBase64Avatar();
  }, []);

  if (!base64Avatar) {
    return (
      <View style={styles.noPreview}>
        <Text style={styles.noPreviewText}>Tidak ada preview tersimpan</Text>
      </View>
    );
  }

  return (
    <View style={styles.previewContainer}>
      <Image 
        source={{ uri: `data:image/jpeg;base64,${base64Avatar}` }}
        style={styles.previewImage}
      />
      <Text style={styles.previewInfo}>Loaded from cache</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffeaea',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  previewContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  previewInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  noPreview: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  noPreviewText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    minWidth: 120,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
});

export default ImagePickerModal;