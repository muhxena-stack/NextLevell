// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = () => {
    if (login(email, password)) {
      // Login success
    }
  };

  const quickLogin = () => {
    setEmail('user@example.com');
    setPassword('password');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🛒</Text>
          <Text style={styles.title}>Mini E-Commerce</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoButton} onPress={quickLogin}>
            <Text style={styles.demoButtonText}>Try Demo Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Enter any email and password to continue
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF', // Blue background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#007AFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    fontWeight: '400',
    textAlign: 'center',
  },
  form: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
    borderWidth: 2,
    borderColor: '#E3F2FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#E3F2FD',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;