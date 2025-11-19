import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { authAPI } from '../../utils/api';

export default function AuthenticationKeyScreen() {
  const [recoveryKey, setRecoveryKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  // Don't generate key here - it comes from backend after signup
  useEffect(() => {
    setRecoveryKey('Creating account...');
    // Automatically complete signup when screen loads
    completeSignup();
  }, []);

  const handleCopy = async () => {
    try {
      if (!recoveryKey || recoveryKey === 'Creating account...') {
        Alert.alert('Error', 'Recovery key not yet generated');
        return;
      }
      
      // Copy to clipboard
      await Clipboard.setStringAsync(recoveryKey);
      
      // Mark that user has saved the key
      setKeySaved(true);
      
      // Show success message
      Alert.alert(
        'Recovery Key Copied!',
        'Your recovery key has been copied to clipboard.\n\nPlease save it in a secure location. You will need it to recover your account if you forget your master password.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to copy recovery key to clipboard');
    }
  };

  const handleProceed = async () => {
    if (!keySaved) {
      Alert.alert(
        'Warning',
        'Have you saved your recovery key? You will need it to recover your account if you forget your master password.',
        [
          { text: 'Not Yet', style: 'cancel' },
          { 
            text: 'Yes, I Saved It', 
            onPress: () => router.replace('/(auth)/login' as any)
          }
        ]
      );
      return;
    }

    router.replace('/(auth)/login' as any);
  };

  const completeSignup = async () => {
    setIsLoading(true);
    
    try {
      // Get stored signup data
      const email = await AsyncStorage.getItem('temp_signup_email');
      const username = await AsyncStorage.getItem('temp_signup_username');
      const masterPassword = await AsyncStorage.getItem('temp_signup_master_password');

      if (!email || !username || !masterPassword) {
        throw new Error('Signup data not found. Please start again.');
      }

      // Call signup API to create the account - returns recovery key!
      const response = await authAPI.signup(username, email, masterPassword);

      // Set the recovery key from backend response
      setRecoveryKey(response.recovery_key || '');
      
      // Clear all temporary signup data
      await AsyncStorage.multiRemove([
        'temp_signup_email',
        'temp_signup_username',
        'temp_signup_master_password'
      ]);

      // Show success but keep user on this screen to save recovery key
      Alert.alert(
        '✅ Account Created!',
        'Your account has been created successfully. Please save your recovery key below before proceeding.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
      // On error, go back to allow retry
      router.back();
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.title}>Authentication Code</Text>

            {/* Description */}
            <Text style={styles.description}>
              Please keep this safe.
              
            </Text>
            {/* Description */}
            <Text style={styles.description}>
              If you lose your master password, you will need to input this code to regain access. There is no other way.
            </Text>
            {/* Input Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Recovery key will appear here..."
                  placeholderTextColor="#626262"
                  value={recoveryKey}
                  editable={false}
                  multiline
                  numberOfLines={3}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.copyIcon}
                  onPress={handleCopy}
                  disabled={!recoveryKey || recoveryKey === 'Creating account...'}
                >
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color="#6B72FF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
              style={[styles.proceedButton, isLoading && styles.proceedButtonDisabled]}
              onPress={handleProceed}
              disabled={isLoading}
            >
              <Text style={styles.proceedButtonText}>
                {isLoading ? 'Creating Account...' : 'I Have Saved My Recovery Key'}
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#6B72FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  inputContainer: {
    marginTop: 40,
    marginBottom: 40,
    marginHorizontal: 16,
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B72FF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 48,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
    
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#11181C',
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  copyIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  proceedButton: {
    backgroundColor: '#6B72FF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CDCED0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: 16,
    marginBottom: 36,
    height: 58,
    minHeight: 56,
  },
  proceedButtonDisabled: {
    opacity: 0.6,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

