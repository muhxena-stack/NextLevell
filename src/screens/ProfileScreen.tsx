import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native'; // <-- Alert sudah diimpor
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'; 
import { useCart } from '../context/CartContext'; 

// Data dummy untuk opsi menu
const menuOptions = [
  { id: 1, name: 'Pesanan Saya', icon: 'bag-shopping', screen: 'Orders' },
  { id: 2, name: 'Alamat Pengiriman', icon: 'location-dot', screen: 'Addresses' },
  { id: 3, name: 'Metode Pembayaran', icon: 'credit-card', screen: 'Payments' },
  { id: 4, name: 'Pengaturan', icon: 'gear', screen: 'Settings' },
  { id: 5, name: 'Bantuan', icon: 'circle-info', screen: 'Help' },
  { id: 6, name: 'Keluar', icon: 'right-from-bracket', action: 'logout', color: 'red' },
];

const ProfileScreen: React.FC = () => {
  const { getTotalItems, getTotalPrice } = useCart(); 

  const handleAction = (action?: string) => {
    if (action === 'logout') {
      Alert.alert(
        "Keluar Akun", 
        "Apakah Anda yakin ingin keluar dari akun?", 
        [
          { text: "Batal", style: "cancel" },
          { text: "Ya, Keluar", onPress: () => console.log('User logged out (Placeholder)') }
        ]
      );
    } else {
      Alert.alert(
        "Navigasi", 
        `Navigasi ke ${action || 'Screen'} belum diimplementasikan.`, 
      );
      console.log(`Navigasi ke ${action || 'Screen'}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        
        {/* HEADER: FOTO PROFIL & NAMA */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {/* FOTO PROFIL SIMPEL */}
            <FontAwesome6 name="user-circle" size={90} color="#007AFF" /> 
          </View>
          <Text style={styles.userName}>NextLevel</Text>
          <Text style={styles.userEmail}>pengguna123@email.com</Text>
        </View>

        {/* MENU OPSI SIMPEL */}
        <View style={styles.menuContainer}>
          {menuOptions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem, 
                // Hapus border di item terakhir
                index === menuOptions.length - 1 ? { borderBottomWidth: 0 } : {}
              ]}
              onPress={() => handleAction(item.action || item.screen)}
            >
              <View style={styles.menuLeft}>
                <FontAwesome6 
                  name={item.icon} 
                  size={20} 
                  color={item.color || '#555'} 
                  style={styles.menuIcon} 
                />
                <Text style={[styles.menuText, { color: item.color || '#333' }]}>{item.name}</Text>
              </View>
              {/* Hanya tampilkan chevron untuk item biasa */}
              {item.action !== 'logout' && (
                <FontAwesome6 name="chevron-right" size={12} color="#999" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Footer info (Opsional) */}
        <Text style={styles.versionText}>Versi Aplikasi 1.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7', 
  },
  container: {
    flex: 1,
  },
  // --- HEADER ---
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFF',
    marginBottom: 10, 
  },
  avatarContainer: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#888',
  },
  // --- MENU ---
  menuContainer: {
    backgroundColor: '#FFF',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE', 
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 30, 
    marginRight: 15,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 10,
    color: '#AAAAAA',
  }
});

export default ProfileScreen;