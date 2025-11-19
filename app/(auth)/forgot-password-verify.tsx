import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../../utils/api';

export default function ForgotPasswordVerifyScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string || '';
  
  const [recoveryKey, setRecoveryKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!recoveryKey.trim()) {
      Alert.alert('Error', 'Please enter your recovery key');
      return;
    }

    // Validate format: XXXX-XXXX-XXXX-XXXX
    const cleanKey = recoveryKey.toUpperCase().trim();
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanKey)) {
      Alert.alert('Invalid Format', 'Recovery key must be in format: XXXX-XXXX-XXXX-XXXX');
      return;
    }

    setIsLoading(true);
    try {
      // Verify recovery key with backend
      await authAPI.verifyRecoveryKey(email, cleanKey);
      
      // Navigate to reset password screen with email
      router.push({
        pathname: '/forgot-password-reset',
        params: { email }
      } as any);
    } catch (error: any) {
      console.error('Recovery key verification failed:', error);
      Alert.alert('Invalid Recovery Key', error.message || 'The recovery key you entered is incorrect. Please try again.');
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
            <Text style={styles.title}>Enter Recovery Key</Text>

            {/* Description */}
            <Text style={styles.description}>
              Please enter the recovery key you received during signup. It's in the format: XXXX-XXXX-XXXX-XXXX
            </Text>

            {/* Email Display */}
            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Resetting password for:</Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  placeholderTextColor="#626262"
                  value={recoveryKey}
                  onChangeText={setRecoveryKey}
                  keyboardType="default"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={19}  // 16 chars + 3 dashes
                />
              </View>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              <Text style={styles.verifyButtonText}>
                {isLoading ? 'Verifying...' : 'Verify Recovery Key'}
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
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  emailContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  inputContainer: {
    marginTop: 40,
    marginBottom: 40,
    marginHorizontal: 16,
  },
  inputWrapper: {
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B72FF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#11181C',
    paddingVertical: 0,
  },
  verifyButton: {
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
    marginTop: -26,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: 16,
    marginBottom: 36,
    height: 58,
    minHeight: 56,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

