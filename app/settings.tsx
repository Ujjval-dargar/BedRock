import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { passwordAPI, storageAPI, authAPI } from '../utils/api';
import { aesDecrypt, validatePasswordStrength } from '../utils/crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EditProfileModal } from '../components/edit-profile-modal';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';
import {
  isBiometricAvailable,
  isBiometricLoginEnabled,
  enableBiometricLogin,
  disableBiometricLogin,
  getBiometricType,
  getSavedBiometricEmail,
  isBiometricForDifferentAccount,
} from '../utils/biometric';

type SettingsItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap;
  iconFamily: 'Ionicons' | 'MaterialIcons';
  title: string;
  subtitle: string;
  type: 'arrow' | 'toggle';
  toggleValue?: boolean;
  accentColor: string;
  accentBackground: string;
};

const settingsItems: SettingsItem[] = [
  {
    id: 'shared-passwords',
    icon: 'share-social',
    iconFamily: 'Ionicons',
    title: 'Shared Passwords',
    subtitle: 'Manage shared credentials',
    type: 'arrow',
    accentColor: '#8B5CF6',
    accentBackground: '#F3E8FF',
  },
  {
    id: 'account-security',
    icon: 'shield-checkmark',
    iconFamily: 'Ionicons',
    title: 'Account Security',
    subtitle: 'Passwords, privacy & recovery',
    type: 'arrow',
    accentColor: '#6F6BF5',
    accentBackground: '#F5F0FF',
  },
  {
    id: 'auto-fill',
    icon: 'flash',
    iconFamily: 'Ionicons',
    title: 'Auto Fill',
    subtitle: 'Fill forms & passwords automatically',
    type: 'toggle',
    toggleValue: true,
    accentColor: '#10B981',
    accentBackground: '#D1FAE5',
  },
  {
    id: 'biometric',
    icon: 'finger-print',
    iconFamily: 'Ionicons',
    title: 'Biometric Login',
    subtitle: 'Unlock with fingerprint or Face ID',
    type: 'toggle',
    toggleValue: false, // Will be updated dynamically
    accentColor: '#EC4899',
    accentBackground: '#FCE7F3',
  },
  {
    id: 'backup',
    icon: 'cloud-upload',
    iconFamily: 'Ionicons',
    title: 'Backup & Sync',
    subtitle: 'Secure cloud backup enabled',
    type: 'arrow',
    accentColor: '#3B82F6',
    accentBackground: '#DBEAFE',
  },
  {
    id: 'help-support',
    icon: 'help-circle',
    iconFamily: 'Ionicons',
    title: 'Help & Support',
    subtitle: 'FAQs, chat & tutorials',
    type: 'arrow',
    accentColor: '#14B8A6',
    accentBackground: '#CCFBF1',
  },
];

type SettingsItemRowProps = {
  item: SettingsItem;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  onPress?: () => void;
};

const SettingsItemRow = ({ item, toggleValue, onToggleChange, onPress }: SettingsItemRowProps) => {
  const renderIcon = () => {
    const iconSize = 24;

    if (item.iconFamily === 'Ionicons') {
      return <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={iconSize} color={item.accentColor} />;
    }
    return <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={iconSize} color={item.accentColor} />;
  };

  return (
    <TouchableOpacity 
      style={styles.settingsItem} 
      activeOpacity={0.7}
      onPress={item.type === 'arrow' ? onPress : undefined}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.accentBackground }]}> 
          {renderIcon()}
        </View>
        <View style={styles.settingsTextGroup}>
          <Text style={styles.settingsItemText}>{item.title}</Text>
          <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      {item.type === 'arrow' ? (
        <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
      ) : (
        <Switch
          value={toggleValue ?? false}
          onValueChange={onToggleChange}
          trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
          thumbColor={toggleValue ? '#6F6BF5' : '#F3F4F6'}
          ios_backgroundColor="#E5E7EB"
        />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordStats, setPasswordStats] = useState({
    total: 0,
    safe: 0,
    securePercentage: 0,
  });

  const profileInitials = username ? username.substring(0, 2).toUpperCase() : 'U';

  useEffect(() => {
    fetchUserData();
    analyzePasswords();
    checkBiometricAvailability();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await authAPI.getMe();
      setUsername(user.username);
      setEmail(user.email);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      // Get current user's email to check biometric status
      const currentEmail = await AsyncStorage.getItem('user_email');
      
      const available = await isBiometricAvailable();
      const enabled = currentEmail 
        ? await isBiometricLoginEnabled(currentEmail)
        : await isBiometricLoginEnabled();
      const type = await getBiometricType();
      
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
      setBiometricType(type);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const analyzePasswords = async () => {
    try {
      setLoading(true);
      const passwords = await passwordAPI.list();
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        console.error('Vault key not found');
        return;
      }

      let weakCount = 0;
      let safeCount = 0;

      // Decrypt all passwords and analyze
      for (const pwd of passwords) {
        try {
          const decrypted = await aesDecrypt(pwd.encrypted_password, vaultKey);
          
          // Check strength
          const strength = validatePasswordStrength(decrypted);
          if (!strength.isStrong) {
            weakCount++;
          } else {
            safeCount++;
          }
        } catch (error) {
          console.error('Failed to decrypt password:', error);
        }
      }

      const securePercentage = passwords.length > 0 
        ? Math.round((safeCount / passwords.length) * 100)
        : 100;

      setPasswordStats({
        total: passwords.length,
        safe: safeCount,
        securePercentage,
      });
    } catch (error: any) {
      console.error('Failed to analyze passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear any stored auth data here (AsyncStorage, SecureStore, etc.)
    // For now, navigate back to welcome screen
    router.replace('/welcome' as any);
  };

  const handleSaveProfile = async (newUsername: string, newEmail: string) => {
    try {
      await authAPI.updateMe(newUsername, newEmail);
      setUsername(newUsername);
      setEmail(newEmail);
      Alert.alert('Success', 'Your profile has been updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometricAvailable) {
      Alert.alert('Fingerprint Unavailable', 'Fingerprint authentication is not available on this device');
      return;
    }

    try {
      if (value) {
        // Enable biometric - show password modal
        const email = await AsyncStorage.getItem('user_email');
        const userIdStr = await AsyncStorage.getItem('user_id');
        
        if (!email || !userIdStr) {
          Alert.alert('Error', 'User information not found. Please login again.');
          return;
        }

        // Check if biometric is enabled for a different account
        const isDifferentAccount = await isBiometricForDifferentAccount(email);
        if (isDifferentAccount) {
          const savedEmail = await getSavedBiometricEmail();
          Alert.alert(
            'Biometric Already Enabled',
            `Fingerprint authentication is currently enabled for ${savedEmail || 'another account'}.\n\nEnabling it for ${email} will disable it for the other account.`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Continue',
                onPress: () => setShowPasswordModal(true),
              },
            ]
          );
          return;
        }

        // Show password input modal
        setShowPasswordModal(true);
      } else {
        // Disable biometric
        await disableBiometricLogin();
        setBiometricEnabled(false);
        Alert.alert('Success', 'Fingerprint login disabled');
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'Failed to update fingerprint settings');
    }
  };

  const handleEnableBiometric = async () => {
    if (!masterPassword.trim()) {
      Alert.alert('Error', 'Master password is required');
      return;
    }

    try {
      const email = await AsyncStorage.getItem('user_email');
      const userIdStr = await AsyncStorage.getItem('user_id');
      
      if (!email || !userIdStr) {
        Alert.alert('Error', 'User information not found.');
        setShowPasswordModal(false);
        setMasterPassword('');
        return;
      }

      const success = await enableBiometricLogin(userIdStr, email, masterPassword);
      if (success) {
        setBiometricEnabled(true);
        setShowPasswordModal(false);
        setMasterPassword('');
        Alert.alert('Success', 'Fingerprint login enabled successfully!');
      } else {
        Alert.alert('Error', 'Incorrect master password. Please try again.');
      }
    } catch (error: any) {
      console.error('Error enabling biometric:', error);
      // Check if error is due to invalid password
      if (error.message && error.message.includes('Invalid master password')) {
        Alert.alert('Error', 'Incorrect master password. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to enable fingerprint authentication');
      }
    }
  };

  const handleCancelPasswordModal = () => {
    setShowPasswordModal(false);
    setMasterPassword('');
    setShowPassword(false);
  };

  const handleItemPress = (itemId: string) => {
    console.log('Pressed:', itemId);
    // Handle navigation based on itemId
    if (itemId === 'shared-passwords') {
      router.push('/shared-passwords-list' as any);
    } else if (itemId === 'account-security') {
      router.push('/(security)/account-security' as any);
    } else if (itemId === 'backup') {
      router.push('/(security)/backup-sync' as any);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{profileInitials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{username || 'User'}</Text>
              <Text style={styles.profileEmail}>{email || 'email@example.com'}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton} 
            activeOpacity={0.7}
            onPress={() => setEditModalVisible(true)}
          >
            <Ionicons name="create-outline" size={20} color="#6F6BF5" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#F5F0FF' }]}>
            {loading ? (
              <ActivityIndicator size="small" color="#6F6BF5" />
            ) : (
              <>
                <Ionicons name="key" size={24} color="#6F6BF5" />
                <Text style={styles.statNumber}>{passwordStats.total}</Text>
                <Text style={styles.statLabel}>Passwords</Text>
              </>
            )}
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            {loading ? (
              <ActivityIndicator size="small" color="#F59E0B" />
            ) : (
              <>
                <Ionicons name="shield-checkmark" size={24} color="#F59E0B" />
                <Text style={styles.statNumber}>{passwordStats.safe}</Text>
                <Text style={styles.statLabel}>Safe</Text>
              </>
            )}
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            {loading ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <>
                <Ionicons name="lock-closed" size={24} color="#10B981" />
                <Text style={styles.statNumber}>{passwordStats.securePercentage}%</Text>
                <Text style={styles.statLabel}>Secure</Text>
              </>
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>

        <View style={styles.settingsList}>
          {settingsItems.map((item, index) => (
            <View key={item.id}>
              <SettingsItemRow
                item={item}
                toggleValue={
                  item.id === 'auto-fill' 
                    ? autoFillEnabled 
                    : item.id === 'notifications'
                    ? notificationsEnabled
                    : item.id === 'biometric'
                    ? biometricEnabled && biometricAvailable
                    : undefined
                }
                onToggleChange={
                  item.id === 'auto-fill' 
                    ? setAutoFillEnabled 
                    : item.id === 'notifications'
                    ? setNotificationsEnabled
                    : item.id === 'biometric'
                    ? handleBiometricToggle
                    : undefined
                }
                onPress={() => handleItemPress(item.id)}
              />
              {index < settingsItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <TouchableOpacity style={styles.aboutItem} activeOpacity={0.7}>
            <View style={styles.aboutLeft}>
              <Ionicons name="information-circle-outline" size={20} color="#6F6BF5" />
              <Text style={styles.aboutText}>About BedRock</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.aboutItem} activeOpacity={0.7}>
            <View style={styles.aboutLeft}>
              <Ionicons name="document-text-outline" size={20} color="#6F6BF5" />
              <Text style={styles.aboutText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.aboutItem} activeOpacity={0.7}>
            <View style={styles.aboutLeft}>
              <Ionicons name="shield-outline" size={20} color="#6F6BF5" />
              <Text style={styles.aboutText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Password Modal for Biometric Enable */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelPasswordModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enable Fingerprint</Text>
            <Text style={styles.modalSubtitle}>
              Enter your master password to enable fingerprint authentication
            </Text>

            {/* Password Input */}
            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInput}
                placeholder="Master Password"
                placeholderTextColor="#999"
                value={masterPassword}
                onChangeText={setMasterPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
              <TouchableOpacity
                style={styles.modalEyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#626262"
                />
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleCancelPasswordModal}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonEnable]}
                onPress={handleEnableBiometric}
              >
                <Text style={styles.modalButtonTextEnable}>Enable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        currentUsername={username}
        currentEmail={email}
        onSave={handleSaveProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F0FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6F6BF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  settingsList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTextGroup: {
    flex: 1,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: 60,
  },
  aboutSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  aboutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalInputWrapper: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
  },
  modalEyeIcon: {
    padding: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonEnable: {
    backgroundColor: '#6B72FF',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtonTextEnable: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
