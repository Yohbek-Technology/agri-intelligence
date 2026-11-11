/**
 * useNetwork Hook
 * Subscribes to real-time network connectivity state.
 */
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetwork() {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState(state);
    });
    return () => unsubscribe();
  }, []);

  const isConnected = networkState?.isConnected ?? true;
  const isInternetReachable = networkState?.isInternetReachable ?? true;

  return {
    isConnected,
    isInternetReachable,
    isOffline: !isConnected || isInternetReachable === false,
  };
}

