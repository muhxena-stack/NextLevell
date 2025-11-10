import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 

type RootStackParamList = {
    Onboarding1: undefined;
    Onboarding2: undefined;
    App: undefined; 
};

type OnboardingScreen2NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding2'>;


const OnboardingScreen2 = () => {
  const navigation = useNavigation<OnboardingScreen2NavigationProp>();
  
  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <Text style={styles.emoji}>⚡️</Text>
            <Text style={styles.title}>Navigasi Cepat dan Efisien</Text>
            <Text style={styles.subtitle}>Akses Katalog dan Profil Anda menggunakan tab di bagian bawah layar.</Text>
            
            <Button 
                title="Mulai Belanja Sekarang!"
                onPress={() => navigation.replace('App')} 
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