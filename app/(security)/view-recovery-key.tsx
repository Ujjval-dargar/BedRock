import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

export default function ViewRecoveryKeyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Recovery keys are only shown once during signup
    // They are hashed in the database, so we can't retrieve them
    setIsLoading(false);
  }, []);

  const handleVerify = async () => {
    if (!masterPassword) {
      Alert.alert('Error', 'Please enter your master password');
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: Verify master password with backend
      // For now, just show a message
      setTimeout(() => {
        setIsVerifying(false);
        Alert.alert(
          'Recovery Key Information',
          'Recovery keys are only shown once during account creation for security reasons. They are stored as hashes in our database and cannot be retrieved.\n\nIf you lost your recovery key, please contact support for assistance with account recovery options.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }, 1000);
    } catch (error: any) {
      setIsVerifying(false);
      Alert.alert('Error', error.message || 'Failed to verify password');
    }
  };

  const handleCopy = async () => {
    if (!recoveryKey) return;
    
    try {
      await Clipboard.setStringAsync(recoveryKey);
      Alert.alert('Copied!', 'Recovery key copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy recovery key');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recovery Key</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#6F6BF5" />
              </View>
              <Text style={styles.infoTitle}>Recovery Key Information</Text>
              <Text style={styles.infoText}>
                Your recovery key was shown once during account creation. For security reasons, recovery keys are stored as hashes and cannot be retrieved.
              </Text>
            </View>

            {/* Security Notice */}
            <View style={styles.noticeCard}>
              <View style={styles.noticeHeader}>
                <Ionicons name="information-circle" size={20} color="#2563EB" />
                <Text style={styles.noticeTitle}>Important Security Notice</Text>
              </View>
              <View style={styles.noticeBullets}>
                <View style={styles.bulletItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>
                    Recovery keys are shown only once during signup
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>
                    They are hashed in our database (like passwords)
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>
                    We cannot retrieve your original recovery key
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6F6BF5',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6F6BF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#3B82F6',
    lineHeight: 22,
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  noticeBullets: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
