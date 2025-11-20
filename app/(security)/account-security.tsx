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

export default function AccountSecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Security</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Password Security Info Card */}
        <View style={styles.securityCard}>
          <View style={styles.securityIconContainer}>
            <Ionicons name="shield-checkmark" size={32} color="#6F6BF5" />
          </View>
          <Text style={styles.securityTitle}>Your Master Password Security</Text>
          <Text style={styles.securityText}>
            BedRock uses zero-knowledge encryption. We do not store your master password anywhere — not on our servers, not on your device.
          </Text>
          <Text style={styles.securityText}>
            This means that if you forget your master password, there is no way to recover your vault. Your encrypted data cannot be decrypted without it.
          </Text>
          <View style={styles.featureCard}>
            <Ionicons name="lock-closed" size={20} color="#059669" />
            <Text style={styles.featureText}>
              This is a security feature, not a limitation. Your passwords are truly private and secure.
            </Text>
          </View>
        </View>

        {/* Info Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Important Tips</Text>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Remember your master password — write it down and store it securely offline.</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Use a strong, unique master password that you don't use anywhere else.</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>If you forget it, you will need to create a new account and re-add your passwords.</Text>
          </View>
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
  securityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  securityIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  securityText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
