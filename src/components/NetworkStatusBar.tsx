// src/components/NetworkStatusBar.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetwork } from '../context/NetworkContext';

const NetworkStatusBar: React.FC = () => {
  const { isOnline, connectionType } = useNetwork();

  if (isOnline === null) {
    return null; 
  }

  const getStatusColor = () => {
    if (!isOnline) return '#FF6B6B'; // Red for offline
    if (connectionType === 'cellular') return '#FFA500'; // Orange for cellular
    return '#4CAF50'; // Green for WiFi/other online
  };

  const getStatusText = () => {
    if (!isOnline) return 'Anda sedang offline';
    if (connectionType === 'cellular') return `Mobile Data • ${connectionType}`;
    if (connectionType === 'wifi') return `WiFi • ${connectionType}`;
    return `Online • ${connectionType}`;
  };

  const getStatusIcon = () => {
    if (!isOnline) return '📶';
    if (connectionType === 'cellular') return '📱';
    if (connectionType === 'wifi') return '📡';
    return '🌐';
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor: getStatusColor() }
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getStatusIcon()}</Text>
        <Text style={styles.text}>{getStatusText()}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
    fontSize: 16,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NetworkStatusBar;