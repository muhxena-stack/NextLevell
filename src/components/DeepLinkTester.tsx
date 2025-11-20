// src/components/DeepLinkTester.tsx - FIXED EXPORT VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { deepLinkingService, DeepLinkData } from '../services/deepLinkingService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// ✅ GUNAKAN DEFAULT EXPORT
const DeepLinkTester: React.FC = () => {
  const [testUrl, setTestUrl] = useState('ecommerceapp://product/123');
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize deep linking service
    deepLinkingService.initialize().then(() => {
      setIsConnected(true);
      addLog('✅ Deep Linking Service Connected');
    });

    // Subscribe to deep link events
    const unsubscribe = deepLinkingService.addListener((data: DeepLinkData) => {
      handleDeepLinkEvent(data);
    });

    return () => {
      unsubscribe();
      addLog('🔌 Deep Linking Listener Unsubscribed');
    };
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [logMessage, ...prev.slice(0, 19)]); // Keep last 20 logs
    console.log(logMessage);
  };

  const handleDeepLinkEvent = (data: DeepLinkData) => {
    addLog(`📨 Received: ${data.route} | Params: ${JSON.stringify(data.params)}`);
    
    // ✅ Tugas f: Handle add-to-cart actions
    if (data.route === 'add-to-cart' && data.params.productId) {
      const productId = parseInt(data.params.productId);
      if (!isNaN(productId)) {
        addLog(`🛒 Adding product ${productId} to cart via deep link`);
        
        // Create mock product
        const mockProduct = {
          id: productId,
          nama: `Product ${productId} from Deep Link`,
          harga: Math.floor(Math.random() * 500000) + 50000,
          deskripsi: 'Added via deep link testing',
          kategori: 'Test',
          urlGambar: `https://picsum.photos/200/200?random=${productId}`
        };
        
        addToCart(mockProduct);
        Alert.alert('✅ Success', `Product ${productId} added to cart via deep link!`);
      }
    }

    // ✅ Tugas j: Handle fallback navigation
    if (data.route === 'fallback') {
      addLog(`🔄 Fallback: ${data.params.message}`);
      Alert.alert('Fallback Navigation', data.params.message);
    }
  };

  const handleTestDeepLink = async () => {
    if (!testUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL to test');
      return;
    }

    addLog(`🧪 Testing: ${testUrl}`);
    
    const success = await deepLinkingService.testDeepLink(testUrl);
    if (success) {
      addLog('✅ Test completed successfully');
    } else {
      addLog('❌ Test failed');
    }
  };

  const handleSimulateDeepLink = () => {
    if (!testUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL to simulate');
      return;
    }

    addLog(`🎭 Simulating: ${testUrl}`);
    
    // ✅ FIX: Use the public parseDeepLink method
    const deepLinkData = deepLinkingService.parseDeepLink(testUrl, 'warm_start');
    if (deepLinkData) {
      // Use simulateDeepLink method instead of direct notification
      deepLinkingService.simulateDeepLink(deepLinkData.route, deepLinkData.params);
    } else {
      addLog('❌ Failed to parse URL for simulation');
    }
  };

  const handleQuickTest = (url: string, description: string) => {
    setTestUrl(url);
    addLog(`⚡ Quick Test: ${description}`);
    setTimeout(() => handleTestDeepLink(), 100);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🧹 Logs cleared');
  };

  const getServiceStatus = () => {
    const status = deepLinkingService.getStatus();
    return `Listeners: ${status.listenerCount} | Pending: ${status.pendingActions} | Platform: ${status.platform}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔗 Deep Link Tester</Text>
      <Text style={styles.subtitle}>Test & Debug Deep Linking Functionality</Text>

      {/* Status Bar */}
      <View style={[styles.statusBar, isConnected ? styles.statusConnected : styles.statusDisconnected]}>
        <Text style={styles.statusText}>
          {isConnected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'} | {getServiceStatus()}
        </Text>
      </View>

      {/* Test URL Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Test URL:</Text>
        <TextInput
          style={styles.textInput}
          value={testUrl}
          onChangeText={setTestUrl}
          placeholder="ecommerceapp://product/123"
          placeholderTextColor="#999"
        />
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.testButton]}
            onPress={handleTestDeepLink}
          >
            <Text style={styles.buttonText}>🧪 Test Deep Link</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.simulateButton]}
            onPress={handleSimulateDeepLink}
          >
            <Text style={styles.buttonText}>🎭 Simulate Internally</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Test Buttons */}
      <View style={styles.quickTestContainer}>
        <Text style={styles.sectionTitle}>⚡ Quick Tests:</Text>
        
        <View style={styles.quickTestGrid}>
          <TouchableOpacity 
            style={styles.quickTestButton}
            onPress={() => handleQuickTest('ecommerceapp://product/123', 'Valid Product')}
          >
            <Text style={styles.quickTestText}>🛍️ Product 123</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickTestButton}
            onPress={() => handleQuickTest('ecommerceapp://product/abc', 'Invalid Product ID')}
          >
            <Text style={styles.quickTestText}>❌ Invalid ID</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickTestButton}
            onPress={() => handleQuickTest('ecommerceapp://cart', 'Cart Page')}
          >
            <Text style={styles.quickTestText}>🛒 Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickTestButton}
            onPress={() => handleQuickTest('ecommerceapp://add-to-cart/456', 'Add to Cart')}
          >
            <Text style={styles.quickTestText}>➕ Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickTestButton}
            onPress={() => handleQuickTest('ecommerceapp://profile/user123', 'Valid Profile')}
          >
            <Text style={styles.quickTestText}>👤 Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickTestButton}
            onPress={() => handleQuickTest('ecommerceapp://profile/user@123', 'Invalid Profile')}
          >
            <Text style={styles.quickTestText}>🚫 Invalid Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Auth Status */}
      <View style={styles.authStatus}>
        <Text style={styles.authText}>
          🔐 Auth Status: {isAuthenticated ? '✅ LOGGED IN' : '❌ NOT LOGGED IN'}
        </Text>
        <Text style={styles.authNote}>
          {!isAuthenticated && 'Note: Some protected routes may redirect to login'}
        </Text>
      </View>

      {/* Logs Section */}
      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.logsTitle}>📋 Event Logs</Text>
          <TouchableOpacity onPress={clearLogs}>
            <Text style={styles.clearButton}>🧹 Clear</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.logsScrollView}>
          {logs.length === 0 ? (
            <Text style={styles.noLogsText}>No events yet. Test some deep links!</Text>
          ) : (
            logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      {/* Debug Info */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugTitle}>🐛 Debug Information:</Text>
          <Text style={styles.debugText}>• Platform: {Platform.OS}</Text>
          <Text style={styles.debugText}>• Valid Routes: product, cart, profile, add-to-cart</Text>
          <Text style={styles.debugText}>• Validation: Product ID must be numeric</Text>
          <Text style={styles.debugText}>• Fallback: Invalid links redirect to home</Text>
          <Text style={styles.debugText}>• Auth Required: Cart & Checkout need login</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBar: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  statusConnected: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  statusDisconnected: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#007AFF',
  },
  simulateButton: {
    backgroundColor: '#6f42c1',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  quickTestContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  quickTestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTestButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickTestText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  authStatus: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  authText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  authNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 14,
  },
  logsScrollView: {
    flex: 1,
  },
  noLogsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
  },
  logText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
    marginBottom: 4,
    padding: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  debugInfo: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#856404',
    marginBottom: 2,
  },
});

// ✅ FIX: GUNAKAN DEFAULT EXPORT
export default DeepLinkTester;