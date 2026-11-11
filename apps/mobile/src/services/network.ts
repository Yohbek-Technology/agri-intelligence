import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkCallback = (isConnected: boolean) => void;

class NetworkService {
  private listeners: NetworkCallback[] = [];
  private isConnected: boolean = true;

  constructor() {
    NetInfo.addEventListener((state: NetInfoState) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
      this.isConnected = connected;
      this.listeners.forEach((cb) => cb(connected));
    });
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  subscribe(callback: NetworkCallback): () => void {
    this.listeners.push(callback);
    callback(this.isConnected);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

export const networkService = new NetworkService();

