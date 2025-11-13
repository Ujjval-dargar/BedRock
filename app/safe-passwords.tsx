import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, Image } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BackButton from '@/components/back-button';

export const options = {
  headerShown: false,
};

// Safe password color scheme from analytics
const SAFE_COLORS = {
  primary: '#10B981', // Vibrant green
  light: '#D1FAE5', // Light green background
  iconBg: 'rgba(16, 185, 129, 0.1)', // Green with opacity for icon background
};

// Function to get website icon path and color
const getWebsiteIcon = (website: string): { imagePath?: string; icon?: keyof typeof MaterialIcons.glyphMap; color: string } => {
  const domain = website.toLowerCase().replace('.com', '').replace('.net', '').replace('.org', '');
  
  // Try to load local icon image first, fallback to MaterialIcon
  const iconMap: Record<string, { imagePath?: string; icon?: keyof typeof MaterialIcons.glyphMap; color: string }> = {
    snapchat: { imagePath: 'icons/snapchat.png', icon: 'camera-alt', color: '#FFFC00' },
    twitter: { imagePath: 'icons/twitter.png', icon: 'chat-bubble-outline', color: '#1DA1F2' },
    facebook: { imagePath: 'icons/facebook.png', icon: 'facebook', color: '#1877F2' },
    instagram: { imagePath: 'icons/instagram.png', icon: 'photo-camera', color: '#E4405F' },
    linkedin: { imagePath: 'icons/linkedin.png', icon: 'work', color: '#0077B5' },
    yahoo: { imagePath: 'icons/yahoo.png', icon: 'email', color: '#6001D2' },
    dropbox: { imagePath: 'icons/dropbox.png', icon: 'cloud', color: '#0061FF' },
    adobe: { imagePath: 'icons/adobe.png', icon: 'palette', color: '#FF0000' },
    ebay: { imagePath: 'icons/ebay.png', icon: 'shopping-cart', color: '#E53238' },
    myspace: { imagePath: 'icons/myspace.png', icon: 'people', color: '#008DE4' },
    tumblr: { imagePath: 'icons/tumblr.png', icon: 'article', color: '#36465D' },
    pinterest: { imagePath: 'icons/pinterest.png', icon: 'bookmark', color: '#BD081C' },
    google: { imagePath: 'icons/google.png', icon: 'search', color: '#4285F4' },
    amazon: { imagePath: 'icons/amazon.png', icon: 'shopping-bag', color: '#FF9900' },
    netflix: { imagePath: 'icons/netflix.png', icon: 'movie', color: '#E50914' },
    github: { imagePath: 'icons/github.png', icon: 'code', color: '#181717' },
  };

  return iconMap[domain] || { icon: 'language', color: '#6B7280' };
};

// Icon image mapping - add your icon images here
// Place icons in: BedRock/assets/images/icons/
const iconImageMap: Record<string, any> = {
  snapchat: require('@/assets/images/icons/snapchat.png'),
  twitter: null, // require('@/assets/images/icons/twitter.png'),
  facebook: null, // require('@/assets/images/icons/facebook.png'),
  instagram: null, // require('@/assets/images/icons/instagram.png'),
  linkedin: null, // require('@/assets/images/icons/linkedin.png'),
  yahoo: null, // require('@/assets/images/icons/yahoo.png'),
  dropbox: null, // require('@/assets/images/icons/dropbox.png'),
  adobe: null, // require('@/assets/images/icons/adobe.png'),
  ebay: null, // require('@/assets/images/icons/ebay.png'),
  myspace: null, // require('@/assets/images/icons/myspace.png'),
  tumblr: null, // require('@/assets/images/icons/tumblr.png'),
  pinterest: null, // require('@/assets/images/icons/pinterest.png'),
  google: null, // require('@/assets/images/icons/google.png'),
  amazon: null, // require('@/assets/images/icons/amazon.png'),
  netflix: null, // require('@/assets/images/icons/netflix.png'),
  github: null, // require('@/assets/images/icons/github.png'),
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

// Mock data for safe passwords
const SAFE_PASSWORDS = [
  {
    id: 1,
    website: 'google.com',
    email: 'user@example.com',
    lastUpdated: '2024-01-20',
    strength: 'strong',
  },
  {
    id: 2,
    website: 'github.com',
    email: 'user@example.com',
    lastUpdated: '2024-01-18',
    strength: 'strong',
  },
  {
    id: 3,
    website: 'amazon.com',
    email: 'user@example.com',
    lastUpdated: '2024-01-15',
    strength: 'strong',
  },
  {
    id: 4,
    website: 'netflix.com',
    email: 'user@example.com',
    lastUpdated: '2024-01-12',
    strength: 'strong',
  },
  {
    id: 5,
    website: 'dropbox.com',
    email: 'user@example.com',
    lastUpdated: '2024-01-10',
    strength: 'strong',
  },
  {
    id: 6,
    website: 'adobe.com',
    email: 'user@example.com',
    lastUpdated: '2024-01-08',
    strength: 'strong',
  },
  {
    id: 7,
    website: 'linkedin.com',
    email: 'user@example.com',
    lastUpdated: '2024-01-05',
    strength: 'strong',
  },
  {
    id: 8,
    website: 'yahoo.com',
    email: 'user@example.com',
    lastUpdated: '2024-01-03',
    strength: 'strong',
  },
  {
    id: 9,
    website: 'ebay.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-30',
    strength: 'strong',
  },
  {
    id: 10,
    website: 'pinterest.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-28',
    strength: 'strong',
  },
  {
    id: 11,
    website: 'tumblr.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-25',
    strength: 'strong',
  },
  {
    id: 12,
    website: 'myspace.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-22',
    strength: 'strong',
  },
  {
    id: 13,
    website: 'facebook.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-20',
    strength: 'strong',
  },
  {
    id: 14,
    website: 'twitter.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-18',
    strength: 'strong',
  },
  {
    id: 15,
    website: 'instagram.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-15',
    strength: 'strong',
  },
  {
    id: 16,
    website: 'snapchat.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-12',
    strength: 'strong',
  },
  {
    id: 17,
    website: 'google.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-10',
    strength: 'strong',
  },
  {
    id: 18,
    website: 'github.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-08',
    strength: 'strong',
  },
  {
    id: 19,
    website: 'amazon.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-05',
    strength: 'strong',
  },
  {
    id: 20,
    website: 'netflix.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-03',
    strength: 'strong',
  },
  {
    id: 21,
    website: 'dropbox.com',
    email: 'user@example.com',
    lastUpdated: '2023-12-01',
    strength: 'strong',
  },
  {
    id: 22,
    website: 'adobe.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-28',
    strength: 'strong',
  },
  {
    id: 23,
    website: 'linkedin.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-25',
    strength: 'strong',
  },
  {
    id: 24,
    website: 'yahoo.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-22',
    strength: 'strong',
  },
  {
    id: 25,
    website: 'ebay.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-20',
    strength: 'strong',
  },
  {
    id: 26,
    website: 'pinterest.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-18',
    strength: 'strong',
  },
  {
    id: 27,
    website: 'tumblr.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-15',
    strength: 'strong',
  },
  {
    id: 28,
    website: 'myspace.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-12',
    strength: 'strong',
  },
  {
    id: 29,
    website: 'facebook.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-10',
    strength: 'strong',
  },
  {
    id: 30,
    website: 'twitter.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-08',
    strength: 'strong',
  },
  {
    id: 31,
    website: 'instagram.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-05',
    strength: 'strong',
  },
  {
    id: 32,
    website: 'snapchat.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-03',
    strength: 'strong',
  },
  {
    id: 33,
    website: 'google.com',
    email: 'user@example.com',
    lastUpdated: '2023-11-01',
    strength: 'strong',
  },
  {
    id: 34,
    website: 'github.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-30',
    strength: 'strong',
  },
  {
    id: 35,
    website: 'amazon.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-28',
    strength: 'strong',
  },
  {
    id: 36,
    website: 'netflix.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-25',
    strength: 'strong',
  },
  {
    id: 37,
    website: 'dropbox.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-22',
    strength: 'strong',
  },
  {
    id: 38,
    website: 'adobe.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-20',
    strength: 'strong',
  },
  {
    id: 39,
    website: 'linkedin.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-18',
    strength: 'strong',
  },
  {
    id: 40,
    website: 'yahoo.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-15',
    strength: 'strong',
  },
  {
    id: 41,
    website: 'ebay.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-12',
    strength: 'strong',
  },
  {
    id: 42,
    website: 'pinterest.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-10',
    strength: 'strong',
  },
  {
    id: 43,
    website: 'tumblr.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-08',
    strength: 'strong',
  },
  {
    id: 44,
    website: 'myspace.com',
    email: 'user@example.com',
    lastUpdated: '2023-10-05',
    strength: 'strong',
  },
];

const SafePasswordItem = ({
  website,
  email,
  lastUpdated,
  strength,
}: {
  website: string;
  email: string;
  lastUpdated: string;
  strength: string;
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
        <View style={[styles.safeBadge, { backgroundColor: SAFE_COLORS.light }]}>
          <MaterialIcons name="check-circle" size={14} color={SAFE_COLORS.primary} />
          <Text style={[styles.safeText, { color: SAFE_COLORS.primary }]}>SAFE</Text>
        </View>
      </View>
      <View style={styles.passwordItemBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={16} color="#6B7280" />
          <ThemedText style={styles.emailText}>{email}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
          <ThemedText style={styles.dateText}>Last updated: {formatDate(lastUpdated)}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="lock" size={16} color={SAFE_COLORS.primary} />
          <ThemedText style={styles.strengthText}>Strength: {strength.toUpperCase()}</ThemedText>
        </View>
      </View>
    </View>
  );
};

export default function SafePasswordsScreen() {
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
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Safe Passwords</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{SAFE_PASSWORDS.length} Safe Passwords</ThemedText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Success Banner */}
      <View style={styles.successBanner}>
        <MaterialIcons name="check-circle" size={24} color={SAFE_COLORS.primary} />
        <View style={styles.successTextContainer}>
          <ThemedText style={styles.successTitle}>Great Security!</ThemedText>
          <ThemedText style={styles.successDescription}>
            These passwords meet security standards. Keep them strong and update them regularly for optimal protection.
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{SAFE_PASSWORDS.length}</Text>
            <Text style={styles.statLabel}>Total Safe</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: SAFE_COLORS.primary }]}>
              {SAFE_PASSWORDS.filter((p) => p.strength === 'strong').length}
            </Text>
            <Text style={styles.statLabel}>Strong</Text>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Secure Accounts</ThemedText>

        {SAFE_PASSWORDS.map((password) => (
          <SafePasswordItem
            key={password.id}
            website={password.website}
            email={password.email}
            lastUpdated={password.lastUpdated}
            strength={password.strength}
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: SAFE_COLORS.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40,
  },
  successBanner: {
    flexDirection: 'row',
    backgroundColor: SAFE_COLORS.light,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  successTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  successDescription: {
    fontSize: 14,
    color: '#047857',
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
    borderColor: SAFE_COLORS.light,
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
  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  safeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  passwordItemBody: {
    marginBottom: 4,
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
  strengthText: {
    fontSize: 14,
    color: SAFE_COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});

