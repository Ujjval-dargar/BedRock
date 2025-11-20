import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const features = [
    { icon: 'shield-checkmark', title: 'Military-Grade Encryption', description: 'AES-256 encryption keeps your data secure' },
    { icon: 'finger-print', title: 'Biometric Authentication', description: 'Quick and secure access with Face ID or fingerprint' },
    { icon: 'cloud-upload', title: 'Secure Cloud Backup', description: 'Your data synced safely across all devices' },
    { icon: 'share-social', title: 'Safe Sharing', description: 'Share passwords securely with trusted contacts' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerNav}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerTitle}>About BedRock</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* App Icon & Title */}
        <View style={styles.heroSection}>
          <View style={styles.appIcon}>
            <Ionicons name="lock-closed" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>BedRock</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>Your Secure Digital Vault</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About This App</Text>
          <Text style={styles.description}>
            BedRock is a secure password manager designed to help you store, organize and share your credentials safely.
            With privacy-first design and strong encryption, your sensitive data is always protected.
          </Text>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Features</Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name={feature.icon as any} size={24} color="#6F6BF5" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}

        {/* Contact Card */}
        <View style={[styles.card, styles.contactCard]}>
          <Ionicons name="mail-outline" size={24} color="#6F6BF5" style={{ marginBottom: 8 }} />
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>
            For more information or support, reach out through the app or visit our website.
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Made with 💜 by the BedRock Team</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#6F6BF5', paddingBottom: 32 },
  headerNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitleWrapper: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headerSpacer: { width: 40 },
  heroSection: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  appIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appName: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  version: { fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', fontWeight: '500', marginBottom: 8 },
  tagline: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '400' },
  content: { padding: 20, paddingTop: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 0,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
  description: { fontSize: 15, color: '#6B7280', lineHeight: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 12 },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: { flex: 1, justifyContent: 'center' },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 4 },
  featureDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  contactCard: { backgroundColor: '#F5F0FF', alignItems: 'center', marginTop: 12 },
  contactTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
  contactText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  footer: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 24, marginBottom: 32 },
});
