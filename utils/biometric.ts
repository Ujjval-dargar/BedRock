import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { authAPI } from './api';
import * as Application from 'expo-application';

/**
 * Get unique device identifier
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Use platform-specific device identifiers
    let deviceId: string;
    
    if (Platform.OS === 'android') {
      const androidId = Application.getAndroidId();
      deviceId = `android_${androidId}`;
    } else if (Platform.OS === 'ios') {
      const installId = await Application.getIosIdForVendorAsync();
      deviceId = `ios_${installId || 'unknown'}`;
    } else {
      // Fallback for web or other platforms
      deviceId = `${Platform.OS}_unknown`;
    }
    
    return deviceId;
  } catch (error) {
    // Fallback to a stored UUID
    let storedId = await AsyncStorage.getItem('device_uuid');
    if (!storedId) {
      storedId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('device_uuid', storedId);
    }
    return storedId;
  }
}

/**
 * Check if device supports biometric authentication
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
}

/**
 * Get the type of biometric authentication available
 */
export async function getBiometricType(): Promise<string> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    // Only support fingerprint authentication
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    
    return 'Fingerprint';
  } catch (error) {
    console.error('Error getting biometric type:', error);
    return 'Fingerprint';
  }
}

/**
 * Check if biometric login is enabled for current user
 * Checks the backend database for the user's biometric preference
 * @param email - Optional email to check for specific user (for display purposes)
 */
export async function isBiometricLoginEnabled(email?: string): Promise<boolean> {
  try {
    // Check if user is logged in (has auth token)
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      // User not logged in, can't check backend
      return false;
    }

    // Check backend API for biometric status
    const status = await authAPI.getBiometricStatus();
    return status.biometric_enabled;
  } catch (error: any) {
    // Silent failure for authentication/authorization errors (user not logged in)
    if (error.message?.includes('Not Found') || 
        error.message?.includes('Unauthorized') || 
        error.message?.includes('Could not validate credentials')) {
      return false;
    }
    // Only log unexpected errors
    console.error('Error checking biometric login status:', error);
    return false;
  }
}

/**
 * Authenticate using biometric and login directly
 * This function prompts for biometric authentication and if successful,
 * calls the backend to login directly without password
 * SECURITY: Includes device ID to prevent cross-device biometric attacks
 */
export async function authenticateWithBiometric(email: string): Promise<{
  success: boolean;
  response?: any;
}> {
  try {
    if (!email) {
      return { success: false };
    }

    // Get device ID BEFORE prompting for biometric
    const deviceId = await getDeviceId();

    // First authenticate with device biometric
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with Fingerprint',
      fallbackLabel: 'Use Master Password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      // Device biometric passed, now login with device ID verification
      const response = await authAPI.biometricLogin(email, deviceId);
      
      return {
        success: true,
        response: response,
      };
    }

    return { success: false };
  } catch (error: any) {
    // Don't log errors - they will be handled by the caller with user-friendly alerts
    throw error;
  }
}

/**
 * Enable biometric login for current user
 * Verifies master password with backend before enabling
 * SECURITY: Stores device ID to bind biometric to this specific device
 */
export async function enableBiometricLogin(
  userId: string,
  email: string,
  masterPassword: string
): Promise<boolean> {
  try {
    // First, verify the master password with the backend
    const verification = await authAPI.verifyMasterPassword(email, masterPassword);
    
    if (!verification.valid) {
      throw new Error('Invalid master password');
    }

    // Get device ID
    const deviceId = await getDeviceId();

    // Then, authenticate with biometric to confirm user intent
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Enable Fingerprint Login',
      fallbackLabel: 'Cancel',
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      // Enable biometric in backend database with device ID
      await authAPI.enableBiometric(deviceId);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Disable biometric login
 * Updates backend database only - no local password storage to remove
 */
export async function disableBiometricLogin(): Promise<void> {
  try {
    // Disable biometric in backend database
    await authAPI.disableBiometric();
  } catch (error) {
    // Silently fail - error will be handled by caller if needed
  }
}

/**
 * Get saved biometric email (for display purposes)
 * Returns the currently logged-in user's email
 */
export async function getSavedBiometricEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('user_email');
  } catch (error) {
    return null;
  }
}

/**
 * Check if biometric is enabled for a different account than current
 * This function is no longer needed since backend handles per-user biometric settings
 * Kept for compatibility
 * @param currentEmail - Current user's email
 */
export async function isBiometricForDifferentAccount(currentEmail: string): Promise<boolean> {
  try {
    // With backend storage, biometric is always tied to the logged-in user
    // No need to check for different accounts
    return false;
  } catch (error) {
    return false;
  }
}
