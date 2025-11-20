// src/services/deepLinkingService.ts - COMPLETE FIXED VERSION
import { Linking, Platform, Alert, AppState } from 'react-native';

export interface DeepLinkData {
  url: string;
  route: string;
  params: Record<string, any>;
  timestamp: number;
  type: 'cold_start' | 'warm_start';
}

export class DeepLinkingService {
  private static instance: DeepLinkingService;
  private listeners: ((data: DeepLinkData) => void)[] = [];
  private isInitialized = false;
  private urlSubscription: any = null;

  static getInstance(): DeepLinkingService {
    if (!DeepLinkingService.instance) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing Deep Linking Service...');

      this.setupURLListener();
      this.setupAppStateListener();
      await this.handleInitialURL();

      this.isInitialized = true;
      console.log('✅ Deep Linking Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Deep Linking Service:', error);
    }
  }

  private setupURLListener(): void {
    this.urlSubscription = Linking.addEventListener('url', this.handleIncomingURL);
  }

  private setupAppStateListener(): void {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      console.log('📱 App became active - checking for pending deep links');
      this.checkPendingDeepLinks();
    }
  };

  private async handleInitialURL(): Promise<void> {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('🔗 Processing initial URL (Cold Start):', initialUrl);
        
        const deepLinkData = this.parseDeepLink(initialUrl, 'cold_start');
        if (deepLinkData) {
          this.notifyListeners(deepLinkData);
        }
      }
    } catch (error) {
      console.error('❌ Error handling initial URL:', error);
    }
  }

  private handleIncomingURL = (event: { url: string }) => {
    console.log('🔗 Incoming URL (Warm Start):', event.url);
    
    const deepLinkData = this.parseDeepLink(event.url, 'warm_start');
    if (deepLinkData) {
      this.notifyListeners(deepLinkData);
    }
  };

  // ✅ FIX: Manual URL parsing tanpa URLSearchParams.entries()
  private parseDeepLink(url: string, type: 'cold_start' | 'warm_start'): DeepLinkData | null {
    try {
      console.log('🔍 Parsing Deep Link:', url);

      if (url.startsWith('ecommerceapp://')) {
        const path = url.replace('ecommerceapp://', '');
        return this.parsePath(path, url, type);
      }

      if (url.startsWith('https://miniecommerce.com/')) {
        const path = url.replace('https://miniecommerce.com/', '');
        return this.parsePath(path, url, type);
      }

      console.warn('⚠️ Unsupported URL scheme:', url);
      return null;
    } catch (error) {
      console.error('❌ Error parsing deep link:', error);
      return null;
    }
  }

  private parsePath(path: string, originalUrl: string, type: 'cold_start' | 'warm_start'): DeepLinkData {
    const segments = path.split('/').filter(segment => segment.length > 0);
    const route = segments[0] || 'home';
    const params: Record<string, any> = {};

    // Extract parameters from path segments
    for (let i = 1; i < segments.length; i += 2) {
      if (segments[i + 1]) {
        params[segments[i]] = segments[i + 1];
      }
    }

    // ✅ FIX: Manual query parameter parsing tanpa URLSearchParams.entries()
    this.parseQueryParams(originalUrl, params);

    return {
      url: originalUrl,
      route,
      params,
      timestamp: Date.now(),
      type
    };
  }

  // ✅ NEW: Manual query parameter parsing
  private parseQueryParams(url: string, params: Record<string, any>): void {
    try {
      const queryIndex = url.indexOf('?');
      if (queryIndex === -1) return;

      const queryString = url.substring(queryIndex + 1);
      const pairs = queryString.split('&');
      
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value !== undefined) {
          // Decode URL encoded values
          try {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
          } catch {
            params[key] = value; // Fallback jika decode gagal
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error parsing query parameters:', error);
    }
  }

  // ✅ FIX: Type-safe array iteration untuk listeners
  addListener(callback: (data: DeepLinkData) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(data: DeepLinkData): void {
    console.log('📢 Notifying deep link listeners:', data);
    
    // ✅ FIX: Type-safe iteration dengan regular for loop
    for (let i = 0; i < this.listeners.length; i++) {
      try {
        this.listeners[i](data);
      } catch (error) {
        console.error('❌ Error in deep link listener:', error);
      }
    }
  }

  private async checkPendingDeepLinks(): Promise<void> {
    try {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log('🔗 Processing pending deep link:', url);
        const deepLinkData = this.parseDeepLink(url, 'cold_start');
        if (deepLinkData) {
          this.notifyListeners(deepLinkData);
        }
      }
    } catch (error) {
      console.error('❌ Error checking pending deep links:', error);
    }
  }

  async testDeepLink(url: string): Promise<boolean> {
    try {
      console.log('🧪 Testing deep link:', url);
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        console.log('✅ Deep link test successful:', url);
        return true;
      } else {
        console.warn('⚠️ Cannot open URL:', url);
        
        if (url.includes('https://')) {
          console.log('🔄 Trying to open in browser as fallback...');
          await Linking.openURL(url);
          return true;
        }
        
        Alert.alert(
          'Deep Link Test', 
          `Cannot open: ${url}\n\nMake sure the scheme is registered.`,
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Error testing deep link:', error);
      Alert.alert('Error', 'Failed to test deep link');
      return false;
    }
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      listenerCount: this.listeners.length,
      platform: Platform.OS,
      canTest: this.isInitialized
    };
  }

  cleanup(): void {
    if (this.urlSubscription) {
      this.urlSubscription.remove();
      this.urlSubscription = null;
    }
    
    this.listeners = [];
    this.isInitialized = false;
    console.log('🧹 Deep Linking Service cleaned up');
  }
}

export const deepLinkingService = DeepLinkingService.getInstance();