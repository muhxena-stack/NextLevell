// src/components/DeepLinkTester.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { deepLinkingService } from '../services/deepLinkingService';

const DeepLinkTester: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{name: string, success: boolean, url: string, timestamp: Date}>>([]);
  const [deepLinkStatus, setDeepLinkStatus] = useState<any>(null);

  // ✅ SOAL 5: Get deep linking status
  useEffect(() => {
    const status = deepLinkingService.getStatus();
    setDeepLinkStatus(status);
  }, []);

  const testLinks = [
    // ✅ SOAL 1: Basic Deep Links
    { name: '🏠 Home', url: 'ecommerceapp://home' },
    { name: '📱 Home (Universal)', url: 'https://miniecommerce.com/home' },
    
    // ✅ SOAL 2: Product Deep Links
    { name: '🛍️ Product 123', url: 'ecommerceapp://product/123' },
    { name: '📦 Product 404', url: 'ecommerceapp://product/404' },
    { name: '🔗 Product Universal', url: 'https://miniecommerce.com/product/456' },
    
    // ✅ SOAL 3: Cart & Navigation
    { name: '🛒 Cart', url: 'ecommerceapp://cart' },
    { name: '📋 Products List', url: 'ecommerceapp://products' },
    
    // ✅ SOAL 4: Profile dengan Validasi
    { name: '👤 Profile user123', url: 'ecommerceapp://profile/user123' },
    { name: '👥 Profile john_doe', url: 'ecommerceapp://profile/john_doe' },
    { name: '🔗 Profile Universal', url: 'https://miniecommerce.com/profile/mary_jane' },
    
    // ✅ SOAL 5: Error Cases untuk Testing
    { name: '❌ Invalid Product ID', url: 'ecommerceapp://product/abc' },
    { name: '❌ Short User ID', url: 'ecommerceapp://profile/ab' },
    { name: '❌ Invalid Characters', url: 'ecommerceapp://profile/user@123' },
    { name: '❌ Unknown Route', url: 'ecommerceapp://unknown' },
    
    // ✅ Additional Test Cases
    { name: '🔐 Login', url: 'ecommerceapp://login' },
    { name: '⚙️ Settings', url: 'ecommerceapp://settings' },
    { name: '📊 Analytics', url: 'ecommerceapp://analytics' },
  ];

  const handleTestLink = async (testName: string, url: string) => {
    try {
      console.log(`🧪 Testing: ${testName} - ${url}`);
      
      const success = await deepLinkingService.testDeepLink(url);
      
      setTestResults(prev => [
        {
          name: testName,
          success,
          url,
          timestamp: new Date()
        },
        ...prev.slice(0, 9) // Keep last 10 results
      ]);

      if (success) {
        console.log(`✅ Test passed: ${testName}`);
      } else {
        console.warn(`⚠️ Test failed: ${testName}`);
      }
    } catch (error) {
      console.error(`❌ Test error: ${testName}`, error);
      
      setTestResults(prev => [
        {
          name: testName,
          success: false,
          url,
          timestamp: new Date()
        },
        ...prev.slice(0, 9)
      ]);
    }
  };

  const runAllTests = async () => {
    Alert.alert(
      'Run All Tests?',
      `This will test ${testLinks.length} deep links. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Run All', 
          onPress: async () => {
            for (const link of testLinks) {
              await handleTestLink(link.name, link.url);
              // ✅ FIX: TypeScript fix untuk setTimeout
              await new Promise<void>(resolve => setTimeout(resolve, 500));
            }
          } 
        }
      ]
    );
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getSuccessRate = () => {
    if (testResults.length === 0) return 0;
    const successful = testResults.filter(result => result.success).length;
    return (successful / testResults.length) * 100;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧪 Deep Link Tester</Text>
      <Text style={styles.subtitle}>Test semua skenario deep linking</Text>
      
      {/* ✅ SOAL 5: Status Information */}
      {deepLinkStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Deep Linking Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Platform</Text>
              <Text style={styles.statusValue}>{deepLinkStatus.platform}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Initialized</Text>
              <Text style={[styles.statusValue, 
                deepLinkStatus.isInitialized ? styles.statusSuccess : styles.statusError
              ]}>
                {deepLinkStatus.isInitialized ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Listeners</Text>
              <Text style={styles.statusValue}>{deepLinkStatus.listenerCount}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Test Results Summary */}
      {testResults.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Test Results ({testResults.length} tests)
          </Text>
          <Text style={[
            styles.successRate,
            { color: getSuccessRate() >= 80 ? '#4caf50' : getSuccessRate() >= 50 ? '#ff9800' : '#f44336' }
          ]}>
            Success: {getSuccessRate().toFixed(1)}%
          </Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controlContainer}>
        <TouchableOpacity style={styles.runAllButton} onPress={runAllTests}>
          <Text style={styles.runAllText}>🚀 Run All Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
          <Text style={styles.clearText}>🗑️ Clear Results</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Test Results */}
      {testResults.slice(0, 5).map((result, index) => (
        <View key={index} style={[
          styles.resultItem,
          result.success ? styles.resultSuccess : styles.resultError
        ]}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={[
              styles.resultStatus,
              result.success ? styles.statusSuccess : styles.statusError
            ]}>
              {result.success ? '✅' : '❌'}
            </Text>
          </View>
          <Text style={styles.resultUrl}>{result.url}</Text>
          <Text style={styles.resultTime}>
            {result.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      ))}

      {/* Test Buttons Grid */}
      <Text style={styles.sectionTitle}>Individual Tests</Text>
      <View style={styles.testGrid}>
        {testLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.testButton,
              link.name.includes('❌') ? styles.errorTestButton : 
              link.name.includes('✅') ? styles.successTestButton : styles.normalTestButton
            ]}
            onPress={() => handleTestLink(link.name, link.url)}
          >
            <Text style={styles.testButtonText}>{link.name}</Text>
            <Text style={styles.testUrlText}>{link.url}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Testing Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Testing Instructions:</Text>
        <Text style={styles.instruction}>1. Click individual tests or "Run All"</Text>
        <Text style={styles.instruction}>2. Check console for detailed logs</Text>
        <Text style={styles.instruction}>3. Success = app navigates correctly</Text>
        <Text style={styles.instruction}>4. Failure = error message or no navigation</Text>
        <Text style={styles.instruction}>5. Red tests = expected to fail (error testing)</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f5f5f5' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 8,
    textAlign: 'center',
    color: '#333'
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 20,
    textAlign: 'center'
  },
  
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statusItem: {
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  statusSuccess: {
    color: '#4caf50'
  },
  statusError: {
    color: '#f44336'
  },
  
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  successRate: {
    fontSize: 14,
    fontWeight: '600'
  },
  
  controlContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  runAllButton: {
    flex: 2,
    backgroundColor: '#2196f3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  runAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  clearText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  
  resultItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4
  },
  resultSuccess: {
    borderLeftColor: '#4caf50'
  },
  resultError: {
    borderLeftColor: '#f44336'
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  resultUrl: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 2
  },
  resultTime: {
    fontSize: 10,
    color: '#999'
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
    color: '#333'
  },
  testGrid: {
    gap: 8,
    marginBottom: 20
  },
  testButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  normalTestButton: {
    backgroundColor: '#fff'
  },
  successTestButton: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50'
  },
  errorTestButton: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336'
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333'
  },
  testUrlText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace'
  },
  
  instructions: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976d2'
  },
  instruction: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
    lineHeight: 16
  }
});

export default DeepLinkTester;