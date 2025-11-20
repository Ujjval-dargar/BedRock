import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../utils/api';

export default function MasterPasswordScreen() {
  const [username, setUsername] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [showConfirmMasterPassword, setShowConfirmMasterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Show warning popup when screen loads
  useEffect(() => {
    Alert.alert(
      '⚠️ Important Security Notice',
      'Your master password cannot be recovered if forgotten. Please choose a strong password and store it in a safe place.\n\nThere is no password recovery option available.',
      [{ text: 'I Understand', style: 'default' }]
    );
  }, []);

  // Password validation checks
  const hasMinLength = masterPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(masterPassword);
  const hasLowerCase = /[a-z]/.test(masterPassword);
  const hasDigit = /[0-9]/.test(masterPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(masterPassword);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;

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
      return { isValid: false, message: 'Password must contain at least one digit (0-9)' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { isValid: true, message: '' };
  };

  const handleCreateAccount = async () => {
    if (!username.trim() || !masterPassword.trim() || !confirmMasterPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate username length (minimum 3 characters)
    if (username.trim().length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(masterPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Weak Password', passwordValidation.message);
      return;
    }

    if (masterPassword !== confirmMasterPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get email from previous screen
      const email = await AsyncStorage.getItem('temp_signup_email');
      if (!email) {
        throw new Error('Email not found');
      }

      // Store signup data temporarily for later steps
      await AsyncStorage.setItem('temp_signup_username', username);
      await AsyncStorage.setItem('temp_signup_master_password', masterPassword);
      
      // Navigate to email verification
      router.push('/(security)/email-verification' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to proceed');
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
            <Text style={styles.title}>Master Password</Text>

            {/* Description */}
            <Text style={styles.description}>
              Please create your master password
            </Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#626262"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

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

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Master Password"
                  placeholderTextColor="#626262"
                  value={confirmMasterPassword}
                  onChangeText={setConfirmMasterPassword}
                  secureTextEntry={!showConfirmMasterPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmMasterPassword(!showConfirmMasterPassword)}
                >
                  <Ionicons
                    name={showConfirmMasterPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#626262"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Requirements - Only show when user starts typing */}
              {masterPassword.length > 0 && (
                <View style={[
                  styles.requirementsCard,
                  isPasswordValid ? styles.requirementsCardValid : styles.requirementsCardInvalid
                ]}>
                  <Text style={[
                    styles.requirementsTitle,
                    isPasswordValid ? styles.requirementsTitleValid : styles.requirementsTitleInvalid
                  ]}>
                    Password Requirements:
                  </Text>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={hasMinLength ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={hasMinLength ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={[
                    styles.requirementText,
                    hasMinLength ? styles.requirementTextValid : styles.requirementTextInvalid
                  ]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={hasUpperCase ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={hasUpperCase ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={[
                    styles.requirementText,
                    hasUpperCase ? styles.requirementTextValid : styles.requirementTextInvalid
                  ]}>
                    One uppercase letter
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={hasLowerCase ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={hasLowerCase ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={[
                    styles.requirementText,
                    hasLowerCase ? styles.requirementTextValid : styles.requirementTextInvalid
                  ]}>
                    One lowercase letter
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={hasDigit ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={hasDigit ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={[
                    styles.requirementText,
                    hasDigit ? styles.requirementTextValid : styles.requirementTextInvalid
                  ]}>
                    One digit (0-9)
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={hasSpecialChar ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={hasSpecialChar ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={[
                    styles.requirementText,
                    hasSpecialChar ? styles.requirementTextValid : styles.requirementTextInvalid
                  ]}>
                    One special character (!@#$%^&*)
                  </Text>
                </View>
              </View>
              )}
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              style={[styles.unlockButton, isLoading && styles.unlockButtonDisabled]}
              onPress={handleCreateAccount}
              disabled={isLoading}
            >
              <Text style={styles.unlockButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
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
  unlockButton: {
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
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  requirementsCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
  },
  requirementsCardValid: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  requirementsCardInvalid: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementsTitleValid: {
    color: '#065F46',
  },
  requirementsTitleInvalid: {
    color: '#991B1B',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '500',
  },
  requirementTextValid: {
    color: '#059669',
  },
  requirementTextInvalid: {
    color: '#DC2626',
  },
});


