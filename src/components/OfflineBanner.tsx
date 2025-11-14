// src/components/OfflineBanner.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetwork } from '../context/NetworkContext';

const OfflineBanner: React.FC = () => {
  const { showOfflineBanner, isOnline } = useNetwork();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (showOfflineBanner) {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showOfflineBanner, slideAnim]);

  // Jangan render jika online
  if (isOnline && !showOfflineBanner) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.banner,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.bannerContent}>
        <Text style={styles.bannerText}>📶 Koneksi terputus. Menggunakan mode offline.</Text>
        <View style={styles.offlineIndicator} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  bannerContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 8,
  },
  offlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    opacity: 0.8,
  },
});

export default OfflineBanner;