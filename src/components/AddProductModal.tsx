// src/components/AddProductModal.tsx
import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  ScrollView,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // ← IMPORT BARU
import { Product } from '../types/types';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newProduct: Product) => void; 
}

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Daftar Kategori yang Tersedia
const KATEGORI_PRODUK = [
  'Elektronik',
  'Otomotif', 
  'Bayi',
  'Pakaian',
  'Makanan'
];

const AddProductModal: React.FC<AddProductModalProps> = ({ visible, onClose, onSubmit }) => {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [urlGambar, setUrlGambar] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState<string>(KATEGORI_PRODUK[0]); // ← EXPLICIT TYPE
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    
    // 1. Validasi Wajib Isi
    if (!nama.trim() || !harga.trim() || !urlGambar.trim() || !kategori) {
      setError('⚠️ Semua bidang wajib diisi.');
      return;
    }
    
    // 2. Validasi Format Harga (Harus Angka)
    const parsedHarga = Number(harga.replace(/[^0-9]/g, ''));
    if (isNaN(parsedHarga) || parsedHarga <= 0) {
      setError('⚠️ Harga harus berupa angka yang valid (> 0).');
      return;
    }
    
    // 3. Validasi Format URL Gambar
    if (!isValidUrl(urlGambar)) {
      setError('⚠️ URL Gambar tidak valid.');
      return;
    }

    // 4. Jika valid: Buat objek produk baru
    const newProduct: Product = {
      id: Date.now(), 
      nama: nama.trim(),
      harga: parsedHarga, 
      urlGambar: urlGambar.trim(),
      deskripsi: deskripsi.trim(),
      kategori: kategori,
    };

    // 5. Submit, Reset Form & Tutup Modal
    onSubmit(newProduct);
    resetForm();
    onClose(); 
  };

  const resetForm = () => {
    setNama('');
    setHarga('');
    setUrlGambar('');
    setDeskripsi('');
    setKategori(KATEGORI_PRODUK[0]);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Tambah Produk Baru</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nama Produk</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama produk"
              value={nama}
              onChangeText={setNama}
            />

            <Text style={styles.label}>Kategori</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={kategori}
                onValueChange={(itemValue: string) => setKategori(itemValue)} // ← EXPLICIT TYPE
                style={styles.picker}
              >
                {KATEGORI_PRODUK.map((kat) => (
                  <Picker.Item 
                    key={kat} 
                    label={kat} 
                    value={kat} 
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Harga</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 150000"
              value={harga}
              onChangeText={setHarga}
              keyboardType="numeric"
            />

            <Text style={styles.label}>URL Gambar</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/gambar.jpg"
              value={urlGambar}
              onChangeText={setUrlGambar}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Deskripsi</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Deskripsi singkat produk (opsional)"
              value={deskripsi}
              onChangeText={setDeskripsi}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button 
              title="Batal" 
              onPress={handleClose} 
              color="#ff4444" 
            />
            <View style={styles.buttonSpacer} />
            <Button 
              title="Simpan Produk" 
              onPress={handleSubmit} 
              color="#007AFF"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  scrollView: {
    width: '100%',
    maxHeight: 400,
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonSpacer: {
    width: 10,
  },
  errorText: { 
    color: '#ff4444',
    marginBottom: 15,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#ffeaea',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  }
});

export default AddProductModal;