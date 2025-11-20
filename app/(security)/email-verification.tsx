import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../utils/api';

export default function VerificationScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    loadEmailAndSendCode();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer, canResend]);

  const loadEmailAndSendCode = async () => {
    const tempEmail = await AsyncStorage.getItem('temp_signup_email');
    if (tempEmail) {
      setEmail(tempEmail);
      // Automatically send verification code when screen loads
      await sendVerificationCode(tempEmail);
    } else {
      Alert.alert('Error', 'Email not found. Please start signup again.');
      router.replace('/(auth)/signup' as any);
    }
  };

  const sendVerificationCode = async (emailAddress: string) => {
    try {
      setIsSending(true);
      const response = await authAPI.sendVerificationCode(emailAddress);
      console.log('✓ Verification code sent:', response.message);
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      Alert.alert(
        'Notice',
        'We had trouble sending the verification code via email. For testing, you can use any 6-digit code.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authAPI.verifyEmailCode(email, code);
      
      if (response.verified) {
        console.log('✓ Email verified successfully');
        
        // Complete the signup process
        await completeSignup();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid or expired verification code');
      setIsLoading(false);
    }
  };

  const completeSignup = async () => {
    try {
      // Get stored signup data
      const username = await AsyncStorage.getItem('temp_signup_username');
      const masterPassword = await AsyncStorage.getItem('temp_signup_master_password');

      if (!email || !username || !masterPassword) {
        throw new Error('Signup data not found. Please start again.');
      }

      // Call signup API to create the account
      await authAPI.signup(username, email, masterPassword);
      
      // Clear all temporary signup data
      await AsyncStorage.multiRemove([
        'temp_signup_email',
        'temp_signup_username',
        'temp_signup_master_password'
      ]);

      // Show success and navigate to login
      Alert.alert(
        '✅ Account Created Successfully!',
        'Your account has been created. Please login to continue.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/(auth)/login' as any)
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
      // On error, allow them to try verification again
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) {
      Alert.alert('Please Wait', `You can resend the code in ${resendTimer} seconds`);
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found');
      return;
    }

    try {
      setIsSending(true);
      const response = await authAPI.resendVerificationCode(email);
      
      // Reset timer and disable resend button
      setResendTimer(30);
      setCanResend(false);
      
      Alert.alert('✓ Code Resent', 'Verification code has been resent to your email successfully');
      console.log('✓ Verification code resent:', response.message);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend code');
    } finally {
      setIsSending(false);
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
            <Text style={styles.title}>Enter Verification Code</Text>

            {/* Description */}
            <Text style={styles.description}>
              Check your email! We just sent a verification code to you
            </Text>

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Verification Code"
                  placeholderTextColor="#626262"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
                          {/* Resend OTP Link */}
            <View style={styles.resendContainer}>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={!canResend || isSending}
            >
              <Text style={[
                styles.resendLinkText,
                (!canResend || isSending) && styles.resendLinkTextDisabled
              ]}>
                {canResend 
                  ? 'Did not receive OTP? Resend' 
                  : `Resend OTP in ${resendTimer}s`
                }
              </Text>
            </TouchableOpacity>
            </View>
            </View>



            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={isLoading}
            >
              <Text style={styles.verifyButtonText}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
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
  resendLink: {
    alignItems: 'flex-end',
    marginTop: 8,
    
    marginHorizontal: 16,
  },
  resendLinkText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  resendLinkTextDisabled: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
    opacity: 0.6,
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

