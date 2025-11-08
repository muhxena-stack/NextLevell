// src/screens/OnboardingScreen1.tsx

import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Button, 
    SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 

// 1. Definisikan Tipe Root Stack (Harus konsisten di RootNavigator dan semua Onboarding Screen)
type RootStackParamList = {
    Onboarding1: undefined;
    Onboarding2: undefined; // Tujuan navigasi berikutnya
    AppTabs: undefined; 
};

// 2. Definisikan Tipe Prop Navigasi yang Digunakan oleh Screen ini
type OnboardingScreen1NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding1'>;


const OnboardingScreen1 = () => {
  // 3. Gunakan tipe tersebut saat memanggil useNavigation
  const navigation = useNavigation<OnboardingScreen1NavigationProp>();
  
  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            {/* Konten Text sudah diperbaiki dari potensi error styling */}
            <Text style={styles.emoji}>🛒</Text>
            <Text style={styles.title}>Selamat Datang di Mini E-Commerce!</Text>
            <Text style={styles.subtitle}>Temukan dan kelola produk dengan mudah dan responsif.</Text>
            
            <Button 
                title="Lanjut ke Fitur Utama >>"
                onPress={() => navigation.navigate('Onboarding2')} 
            />
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: '#e0f7fa'
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
  },
  // ✅ FIX: Memastikan styles ini ada untuk menghilangkan garis merah
  emoji: {
      fontSize: 60,
      marginBottom: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 16, 
    marginBottom: 40,
    textAlign: 'center',
    color: '#333'
  },
});

export default OnboardingScreen1;