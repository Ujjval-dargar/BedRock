import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      icon: 'document-text',
      title: 'Data We Collect',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      items: [
        'Account information (email, username)',
        'Encrypted credentials stored by you',
        'BedRock never stores unencrypted passwords on our servers',
      ],
    },
    {
      icon: 'shield-checkmark',
      title: 'How We Use Data',
      color: '#10B981',
      bgColor: '#D1FAE5',
      items: [
        'Provide and maintain the service',
        'Support account recovery processes',
        'Enable optional backup and sync features',
        'Improve security and user experience',
      ],
    },
    {
      icon: 'eye-off',
      title: 'What We Do Not Do',
      color: '#EF4444',
      bgColor: '#FEE2E2',
      items: [
        'Never sell your personal data',
        'Never access your unencrypted passwords',
        'Never share data with third parties for marketing',
      ],
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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroSubtitle}>Last updated: November 2025</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            BedRock takes your privacy seriously. This page provides a summary of how we collect, use, and protect your data.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: section.bgColor }]}>
                <Ionicons name={section.icon as any} size={24} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.bullet}>
                  <View style={[styles.bulletDot, { backgroundColor: section.color }]} />
                </View>
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="mail" size={24} color="#6F6BF5" />
          </View>
          <Text style={styles.contactTitle}>Questions?</Text>
          <Text style={styles.contactText}>
            For privacy-related questions, contact support through the app or visit our website.
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1 },
  listItem: { flexDirection: 'row', marginBottom: 12 },
  bullet: { width: 24, paddingTop: 6 },
  bulletDot: { width: 6, height: 6, borderRadius: 3 },
  listItemText: { flex: 1, fontSize: 15, color: '#374151', lineHeight: 22 },
  contactCard: {
    backgroundColor: '#F5F0FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
  contactText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  footer: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 32 },
});
