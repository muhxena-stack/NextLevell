// src/screens/OnboardingScreen2.tsx

import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// 🛑 FIX: Ganti StackNavigationProp menjadi NativeStackNavigationProp
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 

// 1. Definisikan Tipe Root Stack (Sama dengan RootNavigator.tsx)
type RootStackParamList = {
    Onboarding1: undefined;
    Onboarding2: undefined;
    AppTabs: undefined; // Screen yang dituju saat mengganti stack
};

// 2. Definisikan Tipe Prop Navigasi untuk Screen ini
type OnboardingScreen2NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding2'>;


const OnboardingScreen2 = () => {
  // 3. Gunakan tipe tersebut saat memanggil useNavigation
  const navigation = useNavigation<OnboardingScreen2NavigationProp>();
  
  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <Text style={styles.emoji}>⚡️</Text>
            <Text style={styles.title}>Navigasi Cepat dan Efisien</Text>
            <Text style={styles.subtitle}>Akses Katalog dan Profil Anda menggunakan tab di bagian bawah layar.</Text>
            
            <Button 
                title="Mulai Belanja Sekarang!"
                // Navigasi yang valid
                onPress={() => navigation.replace('AppTabs')} 
            />
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: '#b2ebf2'
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
  },
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

export default OnboardingScreen2;