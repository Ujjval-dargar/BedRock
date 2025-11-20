import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, storageAPI } from '../../utils/api';
import { decryptVaultKey } from '../../utils/crypto';
import { 
  isBiometricAvailable, 
  isBiometricLoginEnabled, 
  authenticateWithBiometric,
  getBiometricType 
} from '../../utils/biometric';

export default function LoginMasterPasswordScreen() {
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  // Check biometric availability and auto-login on mount
  useEffect(() => {
    checkBiometricAndAutoLogin();
  }, []);

  const checkBiometricAndAutoLogin = async () => {
    try {
      // Get the current user's email
      const currentEmail = await AsyncStorage.getItem('temp_login_email');
      
      // Check if biometric authentication was used in login screen
      const biometricAuth = await AsyncStorage.getItem('biometric_authenticated');
      
      if (biometricAuth === 'true') {
        // Auto-login with biometric credentials
        await AsyncStorage.removeItem('biometric_authenticated');
        await handleBiometricLogin();
        return;
      }

      // Check biometric availability on device
      // Note: Can't check backend status here as user hasn't logged in yet
      const available = await isBiometricAvailable();
      
      setBiometricAvailable(available);
      // Always show biometric button if device has it
      // Backend will handle validation when clicked
      if (available) {
        const type = await getBiometricType();
        setBiometricType(type);
        setBiometricEnabled(true); // Show the button, backend will validate
      }
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const handleUnlock = async () => {
    if (!masterPassword.trim()) {
      Alert.alert('Error', 'Please enter your master password');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get email from previous screen
      const email = await AsyncStorage.getItem('temp_login_email');
      if (!email) {
        throw new Error('Email not found');
      }

      // Call login API
      const response = await authAPI.login(email, masterPassword);
      
      // Derive vault key from master password and decrypt the encrypted vault key
      const vaultKey = await decryptVaultKey(
        response.encrypted_vault_key,
        masterPassword,
        response.vault_salt
      );
      
      // Store vault key securely
      await storageAPI.setVaultKey(vaultKey);
      
      // Clear temporary email
      await AsyncStorage.removeItem('temp_login_email');
      
      // Navigate to home screen
      router.replace('/(tabs)/home' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid master password');
    } finally {
      setIsLoading(false);
    }
  };

    const handleBiometric = async () => {
    // Check if biometric is available on device
    if (!biometricAvailable) {
      Alert.alert('Biometric Unavailable', 'Biometric authentication is not available on this device.');
      return;
    }
    
    // Check if biometric is enabled for this account BEFORE prompting
    try {
      const currentEmail = await AsyncStorage.getItem('temp_login_email');
      if (!currentEmail) {
        Alert.alert('Error', 'Email not found. Please go back and enter your email.');
        return;
      }

      // Check biometric status from backend
      const statusCheck = await authAPI.checkBiometricStatus(currentEmail);
      
      if (!statusCheck.user_exists) {
        Alert.alert('Error', 'User not found. Please check your email and try again.');
        return;
      }

      if (!statusCheck.biometric_enabled) {
        // Biometric not enabled for this account - show alert immediately
        Alert.alert(
          'Biometric Disabled',
          'Biometric authentication is not enabled for this account. Please enable it in Settings after logging in.'
        );
        return;
      }

      // Biometric is enabled, proceed with fingerprint prompt
      await handleBiometricLogin();
    } catch (error: any) {
      console.error('Error checking biometric status:', error);
      Alert.alert('Error', 'Failed to verify biometric status. Please try again.');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's email
      const currentEmail = await AsyncStorage.getItem('temp_login_email');
      
      if (!currentEmail) {
        Alert.alert('Error', 'Email not found. Please go back and enter your email.');
        return;
      }
      
      // Authenticate with biometric - this will handle device biometric and backend login
      const result = await authenticateWithBiometric(currentEmail);
      
      if (!result || !result.success || !result.response) {
        Alert.alert('Error', 'Biometric authentication failed');
        return;
      }

      // Biometric login successful, response contains token and crypto data
      const response = result.response;
      
      // Derive vault key from master password hash
      // The backend returns master_password_hash which we can use to derive the vault key
      const vaultKey = await decryptVaultKey(
        response.encrypted_vault_key,
        response.master_password_hash,
        response.vault_salt
      );
      
      // Store vault key securely
      await storageAPI.setVaultKey(vaultKey);
      
      // Clear temporary email and biometric flag
      await AsyncStorage.removeItem('temp_login_email');
      await AsyncStorage.removeItem('biometric_authenticated');
      
      // Navigate to home screen
      router.replace('/(tabs)/home' as any);
    } catch (error: any) {
      console.error('Biometric login error:', error);
      
      // Check if error is due to biometric not being enabled
      if (error.message?.includes('not enabled')) {
        Alert.alert(
          'Biometric Disabled', 
          'Biometric authentication is not enabled for this account. Please enable it in Settings after logging in.'
        );
      } else {
        Alert.alert('Error', error.message || 'Biometric authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgetPassword = async () => {
    const email = await AsyncStorage.getItem('temp_login_email');
    router.push({
      pathname: '/forgot-password-verify',
      params: { email: email || '' }
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'height' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Master Password</Text>

            {/* Description */}
            <Text style={styles.description}>
              Please enter your master password
            </Text>

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Master Password"
                  placeholderTextColor="#626262"
                  value={masterPassword}
                  onChangeText={setMasterPassword}
                  secureTextEntry={!showMasterPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowMasterPassword(!showMasterPassword)}
                >
                  <Ionicons
                    name={showMasterPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#626262"
                  />
                </TouchableOpacity>
              </View>
              {/* Forget Password Link */}
              <TouchableOpacity 
                style={styles.forgetLink}
                onPress={handleForgetPassword}
              >
                <Text style={styles.forgetLinkText}>Forget master Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Unlock Button */}
            <TouchableOpacity
              style={[styles.unlockButton, isLoading && styles.unlockButtonDisabled]}
              onPress={handleUnlock}
              disabled={isLoading}
            >
              <Text style={styles.unlockButtonText}>
                {isLoading ? 'Processing...' : 'Unlock'}
              </Text>
            </TouchableOpacity>

            {/* OR Separator */}
            <View style={styles.orContainer}>
              <Text style={styles.orText}>OR</Text>
            </View>

            {/* Biometric Authentication - Always visible */}
            <TouchableOpacity
              style={styles.biometricContainer}
              onPress={handleBiometric}
              disabled={isLoading}
            >
              <MaterialIcons
                name="fingerprint"
                size={80}
                color={isLoading ? '#CCC' : '#6B72FF'}
              />
              <Text style={styles.biometricText}>
                Fingerprint
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  forgetLink: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  forgetLinkText: {
    fontSize: 15,
    color: '#6B72FF',
    fontWeight: '600',
  },
  unlockButton: {
    backgroundColor: '#6B72FF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B72FF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 32,
    height: 56,
  },
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  orContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  orText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  biometricContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignSelf: 'center',
  },
  biometricText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B72FF',
    fontWeight: '600',
  },
});

