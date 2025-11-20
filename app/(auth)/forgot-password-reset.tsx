import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../../utils/api';
import { PasswordStrengthIndicator } from '../../components/password-strength-indicator';

export default function ForgotPasswordResetScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation function
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { isValid: true, message: '' };
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Weak Password', passwordValidation.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please start over.');
      router.replace('/(auth)/login' as any);
      return;
    }

    setIsLoading(true);
    
    try {
      // Call API to reset password
      await authAPI.resetPassword(email, newPassword);
      
      // Show success message
      Alert.alert(
        '✅ Password Reset Successful',
        'Your password has been reset successfully. You can now login with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/(auth)/login' as any)
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const SAView: any = SafeAreaView;

  return (
    <SAView style={styles.container}>
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
            <Text style={styles.title}>Forgot Password</Text>

            {/* Description */}
            <Text style={styles.description}>
              Create a new password
            </Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#626262"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#626262"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <PasswordStrengthIndicator password={newPassword} />
              )}

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#626262"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#626262"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SAView>
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
    gap: 16,
  },
  inputWrapper: {
    position: 'relative',
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
  eyeIcon: {
    padding: 4,
  },
  signInButton: {
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
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

