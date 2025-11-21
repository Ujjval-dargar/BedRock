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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 300; // 5 minutes in seconds

  // Check biometric availability and auto-login on mount
  useEffect(() => {
    checkBiometricAndAutoLogin();
    checkLockoutStatus();
  }, []);

  // Timer for lockout countdown
  useEffect(() => {
    if (isLocked && remainingTime > 0) {
      const timer = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((lockoutTime - now) / 1000));
        setRemainingTime(timeLeft);
        
        if (timeLeft === 0) {
          setIsLocked(false);
          setFailedAttempts(0);
          clearLockoutData();
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, remainingTime, lockoutTime]);

  const checkLockoutStatus = async () => {
    try {
      const email = await AsyncStorage.getItem('temp_login_email');
      if (!email) return;

      const lockoutKey = `lockout_${email}`;
      const attemptsKey = `failed_attempts_${email}`;
      
      const lockoutData = await AsyncStorage.getItem(lockoutKey);
      const attemptsData = await AsyncStorage.getItem(attemptsKey);
      
      if (lockoutData) {
        const lockoutTimestamp = parseInt(lockoutData, 10);
        const now = Date.now();
        
        if (now < lockoutTimestamp) {
          setIsLocked(true);
          setLockoutTime(lockoutTimestamp);
          const timeLeft = Math.ceil((lockoutTimestamp - now) / 1000);
          setRemainingTime(timeLeft);
        } else {
          await clearLockoutData();
        }
      }
      
      if (attemptsData) {
        setFailedAttempts(parseInt(attemptsData, 10));
      }
    } catch (error) {
      console.error('Error checking lockout status:', error);
    }
  };

  const clearLockoutData = async () => {
    try {
      const email = await AsyncStorage.getItem('temp_login_email');
      if (!email) return;

      const lockoutKey = `lockout_${email}`;
      const attemptsKey = `failed_attempts_${email}`;
      
      await AsyncStorage.removeItem(lockoutKey);
      await AsyncStorage.removeItem(attemptsKey);
    } catch (error) {
      console.error('Error clearing lockout data:', error);
    }
  };

  const recordFailedAttempt = async () => {
    try {
      const email = await AsyncStorage.getItem('temp_login_email');
      if (!email) return;

      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      const attemptsKey = `failed_attempts_${email}`;
      await AsyncStorage.setItem(attemptsKey, newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTimestamp = Date.now() + (LOCKOUT_DURATION * 1000);
        const lockoutKey = `lockout_${email}`;
        
        await AsyncStorage.setItem(lockoutKey, lockoutTimestamp.toString());
        
        setIsLocked(true);
        setLockoutTime(lockoutTimestamp);
        setRemainingTime(LOCKOUT_DURATION);
        
        Alert.alert(
          'Account Temporarily Locked',
          `Too many failed attempts. Please try again in ${Math.ceil(LOCKOUT_DURATION / 60)} minutes.`,
          [{ text: 'OK' }]
        );
      } else {
        const remainingAttempts = MAX_ATTEMPTS - newAttempts;
        Alert.alert(
          'Invalid Password',
          `Incorrect master password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.`
        );
      }
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  };

  const resetFailedAttempts = async (userEmail?: string) => {
    try {
      const email = userEmail || await AsyncStorage.getItem('temp_login_email');
      if (!email) return;

      setFailedAttempts(0);
      const attemptsKey = `failed_attempts_${email}`;
      const lockoutKey = `lockout_${email}`;
      await AsyncStorage.removeItem(attemptsKey);
      await AsyncStorage.removeItem(lockoutKey);
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  };

  const formatLockoutTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

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
      // Silently fail biometric check
    }
  };

  const handleUnlock = async () => {
    if (!masterPassword.trim()) {
      Alert.alert('Error', 'Please enter your master password');
      return;
    }

    if (isLocked) {
      Alert.alert(
        'Account Locked',
        `Too many failed attempts. Please try again in ${formatLockoutTime(remainingTime)}.`
      );
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
      
      // Reset failed attempts BEFORE clearing temporary email
      await resetFailedAttempts(email);
      
      // Clear temporary email
      await AsyncStorage.removeItem('temp_login_email');
      
      // Navigate to home screen
      router.replace('/(tabs)/home' as any);
    } catch (error: any) {
      await recordFailedAttempt();
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
      
      // Reset failed attempts BEFORE clearing temporary email
      await resetFailedAttempts(currentEmail);
      
      // Clear temporary email, biometric flag
      await AsyncStorage.removeItem('temp_login_email');
      await AsyncStorage.removeItem('biometric_authenticated');
      
      // Navigate to home screen
      router.replace('/(tabs)/home' as any);
    } catch (error: any) {
      // Check for specific error messages
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('not enabled on this device')) {
        Alert.alert(
          'Device Not Authorized',
          'Biometric authentication is not enabled on this device. Please use your master password to login, then enable biometric in Settings.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (errorMessage.includes('not enabled')) {
        Alert.alert(
          'Biometric Not Enabled', 
          'Biometric authentication is not enabled for this account. Please login with your master password and enable it in Settings.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Authentication Failed', 
          'Biometric authentication failed. Please try again or use your master password.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
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

            {/* Lockout Warning */}
            {isLocked && (
              <View style={styles.lockoutBanner}>
                <Ionicons name="lock-closed" size={20} color="#DC2626" />
                <Text style={styles.lockoutText}>
                  Account locked. Try again in {formatLockoutTime(remainingTime)}
                </Text>
              </View>
            )}

            {/* Failed Attempts Warning */}
            {!isLocked && failedAttempts > 0 && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={18} color="#F59E0B" />
                <Text style={styles.warningText}>
                  {MAX_ATTEMPTS - failedAttempts} attempt{MAX_ATTEMPTS - failedAttempts !== 1 ? 's' : ''} remaining
                </Text>
              </View>
            )}

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, isLocked && styles.inputDisabled]}>
                <TextInput
                  style={styles.input}
                  placeholder="Master Password"
                  placeholderTextColor="#626262"
                  value={masterPassword}
                  onChangeText={setMasterPassword}
                  secureTextEntry={!showMasterPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLocked}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowMasterPassword(!showMasterPassword)}
                  disabled={isLocked}
                >
                  <Ionicons
                    name={showMasterPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={isLocked ? "#CCC" : "#626262"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Unlock Button */}
            <TouchableOpacity
              style={[
                styles.unlockButton, 
                (isLoading || isLocked) && styles.unlockButtonDisabled
              ]}
              onPress={handleUnlock}
              disabled={isLoading || isLocked}
            >
              <Text style={styles.unlockButtonText}>
                {isLoading ? 'Processing...' : isLocked ? 'Locked' : 'Unlock'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
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
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  lockoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 8,
  },
  lockoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
    textAlign: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
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
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
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

