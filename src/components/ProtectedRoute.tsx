// src/components/ProtectedRoute.tsx
import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigation = useNavigation();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🔐 ProtectedRoute: User not authenticated, redirecting to login');
      // Redirect handled by navigation structure in App.tsx
    }
  }, [isAuthenticated, isLoading, navigation]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Memeriksa autentikasi...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Navigation will handle redirect
  }

  return <>{children}</>;
};