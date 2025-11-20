import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

export default function ChangeMasterPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleViewRecoveryKey = () => {
    router.push('/(security)/view-recovery-key' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Master Password</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="key" size={22} color="#6F6BF5" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Can't change master password</Text>
            <Text style={styles.infoText}>
              For security and privacy, BedRock does not store your master password. That means we cannot change it for you. If you forget it, your encrypted data cannot be decrypted without your master password or recovery key.
            </Text>
            <Text style={styles.infoTextSmall}>
              Options:
            </Text>
            <Text style={styles.infoTextSmall}>• Use your Recovery Key to restore access.</Text>
            <Text style={styles.infoTextSmall}>• If you do not have the recovery key, you'll need to create a new account and re-add passwords.</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewRecoveryKey}>
            <Text style={styles.primaryButtonText}>View Recovery Key</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoTextSmall: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6F6BF5',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
});
