// src/context/NetworkContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NetworkStatus } from '../types/types';

interface NetworkContextType extends NetworkStatus {
  refreshNetworkStatus: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkStatus>({
    isConnected: null,
    isInternetReachable: null,
    connectionType: 'unknown',
    isOnline: false,
  });

  const updateNetworkState = (state: any) => {
    const newState: NetworkStatus = {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      connectionType: state.type,
      isOnline: state.isConnected && state.isInternetReachable,
    };
    
    setNetworkState(newState);
    
    // Log network changes for debugging
    console.log('🌐 Network State Changed:', newState);
  };

  const refreshNetworkStatus = async () => {
    try {
      const state = await NetInfo.fetch();
      updateNetworkState(state);
    } catch (error) {
      console.error('Error refreshing network status:', error);
    }
  };

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(updateNetworkState);

    // Get initial network state
    refreshNetworkStatus();

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  const value: NetworkContextType = {
    ...networkState,
    refreshNetworkStatus,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;