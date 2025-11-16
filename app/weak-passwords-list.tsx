import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, Image } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BackButton from '@/components/back-button';
import { getWebsiteIcon, iconImageMap } from '@/utils/website-icons';

export const options = {
  headerShown: false,
};

// Weak password color scheme from analytics
const WEAK_COLORS = {
  primary: '#F59E0B', // Vibrant amber/yellow
  light: '#FEF3C7', // Light amber background
  iconBg: 'rgba(245, 158, 11, 0.1)', // Amber with opacity for icon background
};

// Component to render website icon (local image or MaterialIcon fallback)
const WebsiteIcon = ({ website, size = 22 }: { website: string; size?: number }) => {
  const iconData = getWebsiteIcon(website);
  const domain = website.toLowerCase().replace('.com', '').replace('.net', '').replace('.org', '');
  
  // Check if we have a local image for this website
  const imageSource = iconImageMap[domain];
  
  if (imageSource) {
    return (
      <Image
        source={imageSource}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }
  
  // Use MaterialIcon as fallback
  return (
    <MaterialIcons
      name={iconData.icon || 'language'}
      size={size}
      color={iconData.color}
    />
  );
};

// Mock data for weak passwords
const WEAK_PASSWORDS = [
  {
    id: 1,
    website: 'snapchat.com',
    email: 'user@example.com',
    foundDate: '2024-01-15',
    daysAgo: 2,
  },
  {
    id: 2,
    website: 'twitter.com',
    email: 'user@example.com',
    foundDate: '2024-01-12',
    daysAgo: 5,
  },
  {
    id: 3,
    website: 'facebook.com',
    email: 'user@example.com',
    foundDate: '2024-01-10',
    daysAgo: 7,
  },
  {
    id: 4,
    website: 'instagram.com',
    email: 'user@example.com',
    foundDate: '2024-01-08',
    daysAgo: 9,
  },
  {
    id: 5,
    website: 'linkedin.com',
    email: 'user@example.com',
    foundDate: '2024-01-05',
    daysAgo: 12,
  },
  {
    id: 6,
    website: 'yahoo.com',
    email: 'user@example.com',
    foundDate: '2024-01-03',
    daysAgo: 14,
  },
  {
    id: 7,
    website: 'dropbox.com',
    email: 'user@example.com',
    foundDate: '2023-12-30',
    daysAgo: 18,
  },
  {
    id: 8,
    website: 'adobe.com',
    email: 'user@example.com',
    foundDate: '2023-12-28',
    daysAgo: 20,
  },
  {
    id: 9,
    website: 'ebay.com',
    email: 'user@example.com',
    foundDate: '2023-12-25',
    daysAgo: 23,
  },
  {
    id: 10,
    website: 'google.com',
    email: 'user@example.com',
    foundDate: '2023-12-22',
    daysAgo: 26,
  },
  {
    id: 11,
    website: 'amazon.com',
    email: 'user@example.com',
    foundDate: '2023-12-20',
    daysAgo: 28,
  },
  {
    id: 12,
    website: 'netflix.com',
    email: 'user@example.com',
    foundDate: '2023-12-18',
    daysAgo: 30,
  },
  {
    id: 13,
    website: 'github.com',
    email: 'user@example.com',
    foundDate: '2023-12-15',
    daysAgo: 33,
  },
  {
    id: 14,
    website: 'pinterest.com',
    email: 'user@example.com',
    foundDate: '2023-12-12',
    daysAgo: 36,
  },
  {
    id: 15,
    website: 'tumblr.com',
    email: 'user@example.com',
    foundDate: '2023-12-10',
    daysAgo: 38,
  },
  {
    id: 16,
    website: 'myspace.com',
    email: 'user@example.com',
    foundDate: '2023-12-08',
    daysAgo: 40,
  },
  {
    id: 17,
    website: 'facebook.com',
    email: 'user@example.com',
    foundDate: '2023-12-05',
    daysAgo: 43,
  },
  {
    id: 18,
    website: 'twitter.com',
    email: 'user@example.com',
    foundDate: '2023-12-03',
    daysAgo: 45,
  },
  {
    id: 19,
    website: 'instagram.com',
    email: 'user@example.com',
    foundDate: '2023-12-01',
    daysAgo: 47,
  },
  {
    id: 20,
    website: 'snapchat.com',
    email: 'user@example.com',
    foundDate: '2023-11-28',
    daysAgo: 50,
  },
  {
    id: 21,
    website: 'linkedin.com',
    email: 'user@example.com',
    foundDate: '2023-11-25',
    daysAgo: 53,
  },
  {
    id: 22,
    website: 'yahoo.com',
    email: 'user@example.com',
    foundDate: '2023-11-22',
    daysAgo: 56,
  },
  {
    id: 23,
    website: 'dropbox.com',
    email: 'user@example.com',
    foundDate: '2023-11-20',
    daysAgo: 58,
  },
  {
    id: 24,
    website: 'adobe.com',
    email: 'user@example.com',
    foundDate: '2023-11-18',
    daysAgo: 60,
  },
  {
    id: 25,
    website: 'ebay.com',
    email: 'user@example.com',
    foundDate: '2023-11-15',
    daysAgo: 63,
  },
  {
    id: 26,
    website: 'google.com',
    email: 'user@example.com',
    foundDate: '2023-11-12',
    daysAgo: 66,
  },
  {
    id: 27,
    website: 'amazon.com',
    email: 'user@example.com',
    foundDate: '2023-11-10',
    daysAgo: 68,
  },
  {
    id: 28,
    website: 'netflix.com',
    email: 'user@example.com',
    foundDate: '2023-11-08',
    daysAgo: 70,
  },
  {
    id: 29,
    website: 'github.com',
    email: 'user@example.com',
    foundDate: '2023-11-05',
    daysAgo: 73,
  },
  {
    id: 30,
    website: 'pinterest.com',
    email: 'user@example.com',
    foundDate: '2023-11-03',
    daysAgo: 75,
  },
  {
    id: 31,
    website: 'tumblr.com',
    email: 'user@example.com',
    foundDate: '2023-11-01',
    daysAgo: 77,
  },
  {
    id: 32,
    website: 'myspace.com',
    email: 'user@example.com',
    foundDate: '2023-10-30',
    daysAgo: 79,
  },
  {
    id: 33,
    website: 'facebook.com',
    email: 'user@example.com',
    foundDate: '2023-10-28',
    daysAgo: 81,
  },
  {
    id: 34,
    website: 'twitter.com',
    email: 'user@example.com',
    foundDate: '2023-10-25',
    daysAgo: 84,
  },
  {
    id: 35,
    website: 'instagram.com',
    email: 'user@example.com',
    foundDate: '2023-10-22',
    daysAgo: 87,
  },
  {
    id: 36,
    website: 'snapchat.com',
    email: 'user@example.com',
    foundDate: '2023-10-20',
    daysAgo: 89,
  },
  {
    id: 37,
    website: 'linkedin.com',
    email: 'user@example.com',
    foundDate: '2023-10-18',
    daysAgo: 91,
  },
  {
    id: 38,
    website: 'yahoo.com',
    email: 'user@example.com',
    foundDate: '2023-10-15',
    daysAgo: 94,
  },
  {
    id: 39,
    website: 'dropbox.com',
    email: 'user@example.com',
    foundDate: '2023-10-12',
    daysAgo: 97,
  },
  {
    id: 40,
    website: 'adobe.com',
    email: 'user@example.com',
    foundDate: '2023-10-10',
    daysAgo: 99,
  },
  {
    id: 41,
    website: 'ebay.com',
    email: 'user@example.com',
    foundDate: '2023-10-08',
    daysAgo: 101,
  },
  {
    id: 42,
    website: 'google.com',
    email: 'user@example.com',
    foundDate: '2023-10-05',
    daysAgo: 104,
  },
  {
    id: 43,
    website: 'amazon.com',
    email: 'user@example.com',
    foundDate: '2023-10-03',
    daysAgo: 106,
  },
];

const WeakPasswordItem = ({
  website,
  email,
  foundDate,
  daysAgo,
}: {
  website: string;
  email: string;
  foundDate: string;
  daysAgo: number;
}) => {
  const websiteIcon = getWebsiteIcon(website);

  // Convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.passwordItem}>
      <View style={styles.passwordItemHeader}>
        <View style={styles.websiteContainer}>
          <View style={[styles.websiteIconContainer, { backgroundColor: hexToRgba(websiteIcon.color, 0.1) }]}>
            <WebsiteIcon website={website} size={22} />
          </View>
          <ThemedText style={styles.websiteText}>{website}</ThemedText>
        </View>
        <View style={[styles.weakBadge, { backgroundColor: WEAK_COLORS.light }]}>
          <Text style={[styles.weakText, { color: WEAK_COLORS.primary }]}>WEAK</Text>
        </View>
      </View>
      <View style={styles.passwordItemBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={16} color="#6B7280" />
          <ThemedText style={styles.emailText}>{email}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
          <ThemedText style={styles.dateText}>Found: {formatDate(foundDate)} ({daysAgo} days ago)</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={styles.changePasswordButton}>
        <MaterialIcons name="lock-reset" size={18} color={WEAK_COLORS.primary} />
        <Text style={styles.changePasswordText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function WeakPasswordsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    (navigation as any)?.setOptions?.({ headerShown: false });
  }, [navigation]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <ThemedText style={styles.headerTitle}>Weak Passwords</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <MaterialIcons name="warning" size={24} color={WEAK_COLORS.primary} />
        <View style={styles.warningTextContainer}>
          <ThemedText style={styles.warningTitle}>Security Warning</ThemedText>
          <ThemedText style={styles.warningDescription}>
            These passwords are weak and easily guessable. Update them to stronger passwords to improve your account security.
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{WEAK_PASSWORDS.length}</Text>
            <Text style={styles.statLabel}>Total Weak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: WEAK_COLORS.primary }]}>
              {WEAK_PASSWORDS.filter((p) => p.daysAgo <= 7).length}
            </Text>
            <Text style={styles.statLabel}>Recent</Text>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Affected Accounts</ThemedText>

        {WEAK_PASSWORDS.map((password) => (
          <WeakPasswordItem
            key={password.id}
            website={password.website}
            email={password.email}
            foundDate={password.foundDate}
            daysAgo={password.daysAgo}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: WEAK_COLORS.primary,
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: WEAK_COLORS.light,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  passwordItem: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: WEAK_COLORS.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  passwordItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  websiteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  websiteText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    letterSpacing: -0.2,
  },
  weakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weakText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  passwordItemBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WEAK_COLORS.light,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  changePasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: WEAK_COLORS.primary,
    marginLeft: 6,
  },
});
