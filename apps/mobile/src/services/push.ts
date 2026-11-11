/**
 * Push Notification Service (Firebase Cloud Messaging)
 * Handles FCM tokens, background wake-ups for delta sync, and outbreak emergency alerts.
 * // FR-MOB-007: Background wake and real-time outbreak broadcasts
 */

export interface PushNotificationPayload {
  title?: string;
  body?: string;
  data?: {
    type?: 'OUTBREAK_ALERT' | 'SYNC_TRIGGER' | 'GRIEVANCE_REPLY' | 'BROADCAST';
    alertId?: string;
    kebeleId?: string;
  };
}

export class PushService {
  private token: string | null = null;
  private listeners: Array<(payload: PushNotificationPayload) => void> = [];

  async registerForPushNotifications(): Promise<string | null> {
    try {
      // FCM Token retrieval (placeholder for native Firebase Messaging module)
      this.token = `fcm-token-${Date.now()}`;
      return this.token;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  onNotificationReceived(listener: (payload: PushNotificationPayload) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Triggered by background wake
  handleBackgroundMessage(payload: PushNotificationPayload): void {
    if (payload.data?.type === 'SYNC_TRIGGER') {
      // Trigger background sync
    }
    this.listeners.forEach((listener) => listener(payload));
  }
}

export const pushService = new PushService();

