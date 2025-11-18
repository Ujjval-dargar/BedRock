import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_CONFIG } from '../config';

// Determine the correct API URL based on environment
const getApiUrl = () => {
  // Always use the configured BASE_URL in development
  if (API_CONFIG.BASE_URL) {
    return API_CONFIG.BASE_URL;
  }
  
  // Fallback to localhost for simulators/emulators
  return Platform.select({
    ios: 'http://localhost:8000',
    android: 'http://10.0.2.2:8000',
    default: 'http://localhost:8000',
  });
};

const API_BASE_URL = getApiUrl() || API_CONFIG.BASE_URL;

console.log('🔗 API Base URL:', API_BASE_URL);

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_ID: 'user_id',
  VAULT_KEY: 'vault_key',
  ENCRYPTED_VAULT_KEY: 'encrypted_vault_key',
  VAULT_SALT: 'vault_salt',
  PUBLIC_KEY: 'public_key',
  ENCRYPTED_PRIVATE_KEY: 'encrypted_private_key',
  EMAIL: 'user_email',
};

// Types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface PasswordEntry {
  id: number;
  owner_id: number;
  title: string;
  username?: string;
  encrypted_password: string;
  url?: string;
  category?: string;
  notes?: string;
  created_at: string;
}

export interface SharedPassword {
  id: number;
  entry_id?: number;
  from_user_id: number;
  to_user_id: number;
  encrypted_key_for_recipient: string;
  encrypted_password: string;
  permission: string;
  status: string;
  created_at: string;
}

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
}

// Helper to make authenticated requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🌐 API Request:', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 API Response:', response.status, endpoint);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('❌ API Error:', error);
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('🔥 Network Error:', error);
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  async signup(username: string, email: string, masterPassword: string): Promise<User> {
    const user = await fetchAPI('/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, master_password: masterPassword }),
    });
    return user;
  },

  async login(email: string, masterPassword: string): Promise<{
    access_token: string;
    encrypted_vault_key: string;
    vault_salt: string;
    public_key_pem: string;
  }> {
    const response = await fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify({ email, master_password: masterPassword }),
    });

    // Store auth token
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
    await AsyncStorage.setItem(STORAGE_KEYS.EMAIL, email);
    await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_VAULT_KEY, response.encrypted_vault_key);
    await AsyncStorage.setItem(STORAGE_KEYS.VAULT_SALT, response.vault_salt);
    await AsyncStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, response.public_key_pem);

    // Fetch and store user ID
    try {
      const user = await fetchAPI('/me');
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.id.toString());
    } catch (error) {
      console.error('Failed to fetch user ID:', error);
    }

    return response;
  },

  async getMe(): Promise<User> {
    return await fetchAPI('/me');
  },

  async logout() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.VAULT_KEY,
      STORAGE_KEYS.ENCRYPTED_VAULT_KEY,
      STORAGE_KEYS.VAULT_SALT,
      STORAGE_KEYS.PUBLIC_KEY,
      STORAGE_KEYS.ENCRYPTED_PRIVATE_KEY,
      STORAGE_KEYS.EMAIL,
    ]);
  },
};

// Password APIs
export const passwordAPI = {
  async create(
    title: string,
    username: string | undefined,
    encryptedPassword: string,
    url?: string,
    category?: string,
    notes?: string
  ): Promise<PasswordEntry> {
    return await fetchAPI('/passwords', {
      method: 'POST',
      body: JSON.stringify({
        title,
        username,
        encrypted_password: encryptedPassword,
        url,
        category,
        notes,
      }),
    });
  },

  async list(): Promise<PasswordEntry[]> {
    return await fetchAPI('/passwords');
  },

  async get(id: number): Promise<PasswordEntry> {
    return await fetchAPI(`/passwords/${id}`);
  },

  async update(
    id: number,
    title: string,
    username: string | undefined,
    encryptedPassword: string,
    url?: string,
    category?: string,
    notes?: string
  ): Promise<PasswordEntry> {
    return await fetchAPI(`/passwords/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        username,
        encrypted_password: encryptedPassword,
        url,
        category,
        notes,
      }),
    });
  },

  async delete(id: number): Promise<void> {
    await fetchAPI(`/passwords/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sharing APIs
export const sharingAPI = {
  async getUserByUsername(username: string): Promise<{ user_id: number; username: string; email: string; public_key_pem: string }> {
    return await fetchAPI(`/users/by-username/${encodeURIComponent(username)}`);
  },

  async getUserById(userId: number): Promise<{ user_id: number; username: string; email: string }> {
    return await fetchAPI(`/users/${userId}`);
  },

  async share(
    entryId: number | undefined,
    toUserId: number,
    encryptedKeyForRecipient: string,
    encryptedPassword: string,
    permission: string = "view"
  ): Promise<SharedPassword> {
    return await fetchAPI('/share', {
      method: 'POST',
      body: JSON.stringify({
        entry_id: entryId,
        to_user_id: toUserId,
        encrypted_key_for_recipient: encryptedKeyForRecipient,
        encrypted_password: encryptedPassword,
        permission: permission,
      }),
    });
  },

  async getIncoming(): Promise<SharedPassword[]> {
    return await fetchAPI('/shared/incoming');
  },

  async getOutgoing(): Promise<SharedPassword[]> {
    return await fetchAPI('/shared/outgoing');
  },

  async getPasswordShares(passwordId: number): Promise<SharedPassword[]> {
    return await fetchAPI(`/passwords/${passwordId}/shares`);
  },

  async deleteShare(shareId: number): Promise<{ status: string; id: number }> {
    return await fetchAPI(`/shared/${shareId}`, {
      method: 'DELETE',
    });
  },

  async accept(shareId: number): Promise<{ status: string }> {
    return await fetchAPI(`/shared/${shareId}/accept`, {
      method: 'POST',
    });
  },

  async getPublicKey(userId: number): Promise<{ user_id: number; public_key_pem: string }> {
    return await fetchAPI(`/users/${userId}/public_key`);
  },
};

// Storage helpers
export const storageAPI = {
  async setVaultKey(vaultKey: string) {
    await AsyncStorage.setItem(STORAGE_KEYS.VAULT_KEY, vaultKey);
  },

  async getVaultKey(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.VAULT_KEY);
  },

  async getEncryptedVaultKey(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_VAULT_KEY);
  },

  async getVaultSalt(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.VAULT_SALT);
  },

  async getPublicKey(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    return token !== null;
  },

  async getUserId(): Promise<number | null> {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    return userId ? parseInt(userId, 10) : null;
  },
};
