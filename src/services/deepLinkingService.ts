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
  private pendingActions: Array<{action: string, data: any}> = [];

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
      this.processPendingActions();
    }
  };

  private async handleInitialURL(): Promise<void> {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('🔗 Processing initial URL (Cold Start):', initialUrl);
        
        const deepLinkData = this.parseDeepLink(initialUrl, 'cold_start');
        if (deepLinkData) {
          if (this.validateDeepLinkParams(deepLinkData)) {
            this.notifyListeners(deepLinkData);
          }
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
      if (this.validateDeepLinkParams(deepLinkData)) {
        this.notifyListeners(deepLinkData);
      }
    }
  };

  // ✅ FIX: Ubah dari private ke public agar bisa diakses dari DeepLinkTester
  public parseDeepLink(url: string, type: 'cold_start' | 'warm_start'): DeepLinkData | null {
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

  // ✅ Tugas j: Validasi parameter deep link
  private validateDeepLinkParams(data: DeepLinkData): boolean {
    if (data.route === 'product' && data.params.id) {
      const productId = data.params.id;
      if (!/^\d+$/.test(productId)) {
        console.warn('❌ Invalid product ID in deep link:', productId);
        
        this.notifyListeners({
          url: data.url,
          route: 'fallback',
          params: { 
            reason: 'invalid_product_id',
            originalRoute: data.route,
            message: 'Tautan tidak valid, dialihkan ke beranda'
          },
          timestamp: Date.now(),
          type: data.type
        });
        
        Alert.alert('Tautan Tidak Valid', 'ID produk harus berupa angka, dialihkan ke beranda');
        return false;
      }
    }

    if (data.route === 'profile' && data.params.userId) {
      const userId = data.params.userId;
      if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
        console.warn('❌ Invalid user ID in deep link:', userId);
        
        this.notifyListeners({
          url: data.url,
          route: 'fallback',
          params: { 
            reason: 'invalid_user_id',
            originalRoute: data.route,
            message: 'Tautan tidak valid, dialihkan ke beranda'
          },
          timestamp: Date.now(),
          type: data.type
        });
        
        Alert.alert('Tautan Tidak Valid', 'ID user tidak valid, dialihkan ke beranda');
        return false;
      }
    }

    return true;
  }

  private parsePath(path: string, originalUrl: string, type: 'cold_start' | 'warm_start'): DeepLinkData {
    const segments = path.split('/').filter(segment => segment.length > 0);
    const route = segments[0] || 'home';
    const params: Record<string, any> = {};

    // ✅ Tugas f: Handle add-to-cart action
    if (route === 'add-to-cart' && segments[1]) {
      params.productId = segments[1];
      params.action = 'add_to_cart';
      console.log(`🛒 Deep Link Action: Add product ${segments[1]} to cart`);
    }

    // Extract parameters dari path segments
    for (let i = 1; i < segments.length; i += 2) {
      if (segments[i + 1]) {
        params[segments[i]] = segments[i + 1];
      }
    }

    this.parseQueryParams(originalUrl, params);

    return {
      url: originalUrl,
      route,
      params,
      timestamp: Date.now(),
      type
    };
  }

  private parseQueryParams(url: string, params: Record<string, any>): void {
    try {
      const queryIndex = url.indexOf('?');
      if (queryIndex === -1) return;

      const queryString = url.substring(queryIndex + 1);
      const pairs = queryString.split('&');
      
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value !== undefined) {
          try {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
          } catch {
            params[key] = value;
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error parsing query parameters:', error);
    }
  }

  addListener(callback: (data: DeepLinkData) => void): () => void {
    this.listeners.push(callback);
    
    // ✅ Tugas f: Process any pending actions untuk new listener
    if (this.pendingActions.length > 0) {
      setTimeout(() => this.processPendingActions(), 100);
    }
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(data: DeepLinkData): void {
    console.log('📢 Notifying deep link listeners:', data);
    
    // ✅ Tugas j: Handle fallback navigation
    if (data.route === 'fallback') {
      console.log('🔄 Fallback navigation:', data.params.message);
    }
    
    for (let i = 0; i < this.listeners.length; i++) {
      try {
        this.listeners[i](data);
      } catch (error) {
        console.error('❌ Error in deep link listener:', error);
      }
    }
  }

  // ✅ Tugas f: Method untuk add-to-cart action
  async triggerAddToCart(productId: number): Promise<void> {
    const action = {
      action: 'add_to_cart',
      data: { productId, timestamp: Date.now() }
    };
    
    this.pendingActions.push(action);
    await this.processPendingActions();
  }

  private async processPendingActions(): Promise<void> {
    if (this.pendingActions.length === 0) return;

    console.log(`🔄 Processing ${this.pendingActions.length} pending actions...`);
    
    const actionsToProcess = [...this.pendingActions];
    this.pendingActions = [];

    for (const pendingAction of actionsToProcess) {
      try {
        if (pendingAction.action === 'add_to_cart') {
          this.notifyListeners({
            url: `ecommerceapp://add-to-cart/${pendingAction.data.productId}`,
            route: 'add-to-cart',
            params: { 
              productId: pendingAction.data.productId,
              source: 'pending_action'
            },
            timestamp: pendingAction.data.timestamp,
            type: 'warm_start'
          });
        }
      } catch (error) {
        console.error('❌ Error processing pending action:', error);
      }
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

  // ✅ Method untuk simulate deep link dari dalam app
  simulateDeepLink(route: string, params: Record<string, any> = {}): void {
    const fakeUrl = `ecommerceapp://${route}/${Object.entries(params).map(([k, v]) => `${k}/${v}`).join('/')}`;
    console.log('🎭 Simulating deep link:', fakeUrl);
    
    const deepLinkData = this.parseDeepLink(fakeUrl, 'warm_start');
    if (deepLinkData) {
      this.notifyListeners(deepLinkData);
    }
  }

  // ✅ NEW: Public method untuk parse URL dari luar class
  public parseURL(url: string): DeepLinkData | null {
    return this.parseDeepLink(url, 'warm_start');
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      listenerCount: this.listeners.length,
      pendingActions: this.pendingActions.length,
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
    this.pendingActions = [];
    this.isInitialized = false;
    console.log('🧹 Deep Linking Service cleaned up');
  }
}

export const deepLinkingService = DeepLinkingService.getInstance();