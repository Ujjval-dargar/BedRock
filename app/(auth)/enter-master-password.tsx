import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, storageAPI } from '../../utils/api';
import { decryptVaultKey } from '../../utils/crypto';

export default function LoginMasterPasswordScreen() {
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleBiometric = () => {
    // TODO: Implement biometric authentication
    alert('Biometric authentication coming soon');
  };

  const handleForgetPassword = () => {
    router.push('/forgot-password-verify' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

            {/* Biometric Authentication */}
            <TouchableOpacity
              style={styles.biometricContainer}
              onPress={handleBiometric}
            >
              <MaterialIcons
                name="fingerprint"
                size={80}
                color="#6B72FF"
              />
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
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
});

