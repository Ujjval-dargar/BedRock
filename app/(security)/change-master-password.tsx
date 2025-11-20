import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../utils/api';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

export default function ChangeMasterPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isPasswordValid = newPassword.length >= 8;

  const validateCurrentPassword = async (): Promise<boolean> => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        throw new Error('User not found');
      }

      // Verify current password by attempting login
      const response = await authAPI.login(username, currentPassword);
      return !!response.access_token;
    } catch (error) {
      return false;
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters long');
      return;
    }

    // Verify current password first
    setIsLoading(true);
    const isCurrentPasswordValid = await validateCurrentPassword();
    
    if (!isCurrentPasswordValid) {
      setIsLoading(false);
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    Alert.alert(
      'Change Master Password',
      'Are you sure you want to change your master password? You will need to log in again with your new password.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
        {
          text: 'Change',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement API endpoint for changing master password
              // For now, show a coming soon message
              Alert.alert(
                'Coming Soon',
                'The ability to change your master password will be available in a future update. This feature requires re-encrypting all your stored passwords.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to change password');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Master Password</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Warning Card */}
          <View style={styles.warningCard}>
            <View style={styles.warningIconContainer}>
              <Ionicons name="warning" size={24} color="#F59E0B" />
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Important</Text>
              <Text style={styles.warningText}>
                Changing your master password will require you to log in again. Make sure you remember your new password.
              </Text>
            </View>
          </View>

          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Master Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Master Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Re-enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements */}
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
                name={isPasswordValid ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={isPasswordValid ? "#10B981" : "#EF4444"} 
              />
              <Text style={[
                styles.requirementText,
                isPasswordValid ? styles.requirementTextValid : styles.requirementTextInvalid
              ]}>
                At least 8 characters
              </Text>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[
              styles.changeButton,
              isLoading && styles.changeButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.changeButtonText}>
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#F59E0B',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 16,
  },
  requirementsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  changeButton: {
    backgroundColor: '#6F6BF5',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#6F6BF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
