import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HelpSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleTutorial = async () => {
    // Reset the tutorial flag to show it again
    await AsyncStorage.setItem('is_first_login', 'true');
    router.push('/(tabs)/home' as any);
  };

  const handleVideos = async () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1';
    await WebBrowser.openBrowserAsync(url);
  };

  const handleReportBug = async () => {
    const url = 'https://forms.gle/Lm48Gcf9kUmceB5X8';
    await WebBrowser.openBrowserAsync(url);
  };

  const handleFeedback = async () => {
    const url = 'https://forms.gle/Lm48Gcf9kUmceB5X8';
    await WebBrowser.openBrowserAsync(url);
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:ujjvaldargar0@gmail.com');
  };

  const faqItems = [
    {
      icon: 'lock-closed',
      question: 'How secure is BedRock?',
      answer: 'BedRock uses military-grade AES-256 encryption to protect your passwords. Your master password is never stored on our servers.',
      color: '#6F6BF5',
      bgColor: '#F5F0FF',
    },
    {
      icon: 'key',
      question: 'What if I forget my master password?',
      answer: 'Use your recovery key to reset your master password. Keep your recovery key safe and never share it.',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      icon: 'cloud-upload',
      question: 'How does backup work?',
      answer: 'Your encrypted data is automatically synced to secure cloud storage when enabled. You can access it from any device.',
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      icon: 'share-social',
      question: 'Can I share passwords safely?',
      answer: 'Yes! BedRock allows you to securely share passwords with trusted contacts using end-to-end encryption.',
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
    },
  ];

  const contactOptions = [
    {
      icon: 'mail',
      title: 'Email Support',
      description: 'ujjvaldargar0@gmail.com',
      action: handleEmailSupport,
    },
    {
      icon: 'book',
      title: 'Documentation',
      description: 'Browse guides and tutorials',
      action: () => {}, // Would open docs
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
            <Text style={styles.headerTitle}>Help & Support</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="help-circle" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>How Can We Help?</Text>
          <Text style={styles.heroSubtitle}>Find answers and get support</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Quick Links */}
        <View style={styles.quickLinksCard}>
          <Text style={styles.quickLinksTitle}>Quick Actions</Text>
          <View style={styles.quickLinksGrid}>
            <TouchableOpacity style={styles.quickLinkItem} activeOpacity={0.7} onPress={handleTutorial}>
              <View style={styles.quickLinkIcon}>
                <Ionicons name="book-outline" size={24} color="#6F6BF5" />
              </View>
              <Text style={styles.quickLinkText}>Tutorial</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLinkItem} activeOpacity={0.7} onPress={handleVideos}>
              <View style={styles.quickLinkIcon}>
                <Ionicons name="videocam-outline" size={24} color="#6F6BF5" />
              </View>
              <Text style={styles.quickLinkText}>Videos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLinkItem} activeOpacity={0.7} onPress={handleReportBug}>
              <View style={styles.quickLinkIcon}>
                <Ionicons name="bug-outline" size={24} color="#6F6BF5" />
              </View>
              <Text style={styles.quickLinkText}>Report Bug</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickLinkItem} activeOpacity={0.7} onPress={handleFeedback}>
              <View style={styles.quickLinkIcon}>
                <Ionicons name="star-outline" size={24} color="#6F6BF5" />
              </View>
              <Text style={styles.quickLinkText}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqItems.map((item, index) => (
          <View key={index} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <View style={[styles.faqIconContainer, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.faqQuestion}>{item.question}</Text>
            </View>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </View>
        ))}

        {/* Contact Support */}
        <Text style={styles.sectionTitle}>Contact Support</Text>
        {contactOptions.map((option, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.contactCard}
            activeOpacity={0.7}
            onPress={option.action}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name={option.icon as any} size={24} color="#6F6BF5" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactTitle}>{option.title}</Text>
              <Text style={styles.contactDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>App Version</Text>
          <Text style={styles.infoText}>BedRock v1.0.0</Text>
          <Text style={styles.infoSubtext}>Last updated: November 2025</Text>
        </View>

        <Text style={styles.footer}>We are here to help 24/7</Text>
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
  quickLinksCard: {
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
  quickLinksTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  quickLinksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickLinkItem: { 
    width: '47%', 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLinkText: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 12 },
  faqCard: {
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
  faqHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  faqIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  faqQuestion: { fontSize: 16, fontWeight: '600', color: '#111', flex: 1 },
  faqAnswer: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginLeft: 48 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: { flex: 1 },
  contactTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 2 },
  contactDescription: { fontSize: 14, color: '#6B7280' },
  infoCard: {
    backgroundColor: '#F5F0FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  infoText: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 4 },
  infoSubtext: { fontSize: 13, color: '#9CA3AF' },
  footer: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 32 },
});
