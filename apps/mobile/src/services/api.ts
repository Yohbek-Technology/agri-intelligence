import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/lib/config';

export const SESSION_TOKEN_KEY = 'agrintel_session_token';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    try {
      const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch {
      // Fallback
    }
    return {};
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const authHeaders = await this.getAuthHeader();
    let url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    if (options.params) {
      const queryParams = new URLSearchParams();
      for (const [key, val] of Object.entries(options.params)) {
        if (val !== undefined) queryParams.append(key, String(val));
      }
      const qs = queryParams.toString();
      if (qs) url += `?${qs}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers as Record<string, string> | undefined),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errorBody.message || `API Error: ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();

