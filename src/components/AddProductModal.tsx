import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  ScrollView, 
} from 'react-native';
import { Product } from '../types/types'; // Path relatif dari src/components/ ke src/types/

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

const AddProductModal: React.FC<AddProductModalProps> = ({ visible, onClose, onSubmit }) => {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [urlGambar, setUrlGambar] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    
    // 1. Validasi Wajib Isi
    if (!nama.trim() || !harga.trim() || !urlGambar.trim()) {
      setError('⚠️ Semua bidang bertanda (*) wajib diisi.');
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
    };

    // 5. Submit, Reset Form & Tutup Modal
    onSubmit(newProduct);
    setNama('');
    setHarga('');
    setUrlGambar('');
    setDeskripsi('');
    onClose(); 
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} 
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Tambah Produk Baru</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView style={{ width: '100%' }}>
            <Text style={styles.label}>Nama Produk (*)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama Produk"
              value={nama}
              onChangeText={setNama}
            />

            <Text style={styles.label}>Harga (*)</Text>
            <TextInput
              style={styles.input}
              placeholder="Harga (misal: 150000)"
              value={harga}
              onChangeText={setHarga}
              keyboardType="numeric" 
            />

            <Text style={styles.label}>URL Gambar (*)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://gambar-produk.com/..."
              value={urlGambar}
              onChangeText={setUrlGambar}
            />

            <Text style={styles.label}>Deskripsi</Text>
            <TextInput
              style={styles.input}
              placeholder="Deskripsi singkat produk (opsional)"
              value={deskripsi}
              onChangeText={setDeskripsi}
              multiline={true}
            />
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button title="Batal" onPress={onClose} color="#ff4444" />
            <View style={{ width: 10 }} />
            <Button title="Simpan Produk" onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ... (Styling AddProductModal)
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
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  errorText: { 
    color: 'red',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default AddProductModal;