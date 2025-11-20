import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      icon: 'person-circle',
      title: 'Account Responsibilities',
      color: '#6F6BF5',
      bgColor: '#F5F0FF',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and master password. All activities under your account are your responsibility.',
    },
    {
      icon: 'lock-closed',
      title: 'Acceptable Use',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      content: 'Use BedRock only for lawful purposes. Do not attempt to breach security, disrupt service, or access data that does not belong to you.',
    },
    {
      icon: 'information-circle',
      title: 'Service Availability',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      content: 'BedRock is provided as-is. While we strive for high availability, we do not guarantee uninterrupted service. Maintenance and updates may cause temporary downtime.',
    },
    {
      icon: 'shield-half',
      title: 'Limitation of Liability',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      content: 'BedRock is not liable for any loss of data, unauthorized access, or damages resulting from use of the service. Always maintain backup copies of critical information.',
    },
    {
      icon: 'refresh',
      title: 'Changes to Terms',
      color: '#10B981',
      bgColor: '#D1FAE5',
      content: 'We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.',
    },
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
            <Text style={styles.headerTitle}>Terms of Service</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Terms of Service</Text>
          <Text style={styles.heroSubtitle}>Effective November 2025</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            By using BedRock, you agree to these terms. Please review them carefully to understand your rights and responsibilities.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: section.bgColor }]}>
                <Ionicons name={section.icon as any} size={28} color={section.color} />
              </View>
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeIcon}>
            <Ionicons name="alert-circle" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.noticeTitle}>Important</Text>
          <Text style={styles.noticeText}>
            These are abbreviated terms for quick reference. For complete legal terms, please visit our website or contact support.
          </Text>
        </View>

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <Ionicons name="chatbubbles" size={24} color="#6F6BF5" style={{ marginBottom: 8 }} />
          <Text style={styles.contactTitle}>Questions About Terms?</Text>
          <Text style={styles.contactText}>
            Contact our support team through the app or visit our website for clarification.
          </Text>
        </View>

        <Text style={styles.footer}>© 2025 BedRock. All rights reserved.</Text>
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', fontWeight: '500' },
  content: { padding: 20, paddingTop: 16 },
  introCard: {
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
  introText: { fontSize: 15, color: '#6B7280', lineHeight: 24, textAlign: 'center' },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: { alignItems: 'center', marginBottom: 12 },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8, textAlign: 'center' },
  sectionContent: { fontSize: 15, color: '#6B7280', lineHeight: 24, textAlign: 'center' },
  noticeCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  noticeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeTitle: { fontSize: 18, fontWeight: '700', color: '#92400E', marginBottom: 8 },
  noticeText: { fontSize: 14, color: '#78350F', textAlign: 'center', lineHeight: 22 },
  contactCard: {
    backgroundColor: '#F5F0FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
  contactText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  footer: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 32 },
});
