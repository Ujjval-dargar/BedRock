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

// Function to get website icon and color
const getWebsiteIcon = (website: string): { imagePath?: string; icon?: keyof typeof MaterialIcons.glyphMap; color: string } => {
  const domain = website.toLowerCase().replace('.com', '').replace('.net', '').replace('.org', '');
  
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

// Icon image mapping
const iconImageMap: Record<string, any> = {
  snapchat: require('@/assets/images/icons/snapchat.png'),
  twitter: null,
  facebook: null,
  instagram: null,
  linkedin: null,
  yahoo: null,
  dropbox: null,
  adobe: null,
  ebay: null,
  myspace: null,
  tumblr: null,
  pinterest: null,
  google: null,
  amazon: null,
  netflix: null,
  github: null,
};

// Component to render website icon
const WebsiteIcon = ({ website, size = 22 }: { website: string; size?: number }) => {
  const iconData = getWebsiteIcon(website);
  const domain = website.toLowerCase().replace('.com', '').replace('.net', '').replace('.org', '');
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
  
  return (
    <MaterialIcons
      name={iconData.icon || 'language'}
      size={size}
      color={iconData.color}
    />
  );
};

// Mock data for leaked passwords
const LEAKED_PASSWORDS = [
  {
    id: 1,
    website: 'facebook.com',
    email: 'user@example.com',
    leakedDate: '2023-05-15',
    severity: 'high',
  },
  {
    id: 2,
    website: 'linkedin.com',
    email: 'user@example.com',
    leakedDate: '2023-08-22',
    severity: 'high',
  },
  {
    id: 3,
    website: 'twitter.com',
    email: 'user@example.com',
    leakedDate: '2023-11-10',
    severity: 'medium',
  },
  {
    id: 4,
    website: 'instagram.com',
    email: 'user@example.com',
    leakedDate: '2024-01-05',
    severity: 'high',
  },
  {
    id: 5,
    website: 'yahoo.com',
    email: 'user@example.com',
    leakedDate: '2023-09-18',
    severity: 'medium',
  },
  {
    id: 6,
    website: 'dropbox.com',
    email: 'user@example.com',
    leakedDate: '2023-07-03',
    severity: 'high',
  },
  {
    id: 7,
    website: 'adobe.com',
    email: 'user@example.com',
    leakedDate: '2023-04-12',
    severity: 'medium',
  },
  {
    id: 8,
    website: 'ebay.com',
    email: 'user@example.com',
    leakedDate: '2023-06-28',
    severity: 'high',
  },
  {
    id: 9,
    website: 'myspace.com',
    email: 'user@example.com',
    leakedDate: '2023-02-14',
    severity: 'low',
  },
  {
    id: 10,
    website: 'tumblr.com',
    email: 'user@example.com',
    leakedDate: '2023-10-30',
    severity: 'medium',
  },
  {
    id: 11,
    website: 'snapchat.com',
    email: 'user@example.com',
    leakedDate: '2024-02-01',
    severity: 'high',
  },
  {
    id: 12,
    website: 'pinterest.com',
    email: 'user@example.com',
    leakedDate: '2023-12-20',
    severity: 'medium',
  },
];

const LeakedPasswordItem = ({
  website,
  email,
  leakedDate,
  severity,
}: {
  website: string;
  email: string;
  leakedDate: string;
  severity: string;
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#FEE2E2';
      case 'medium':
        return '#FEF3C7';
      case 'low':
        return '#D1FAE5';
      default:
        return '#F3F4F6';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const severityColor = getSeverityColor(severity);
  const severityBg = getSeverityBg(severity);
  const websiteIcon = getWebsiteIcon(website);

  // Convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
        <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
          <Text style={[styles.severityText, { color: severityColor }]}>
            {severity.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.passwordItemBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={16} color="#6B7280" />
          <ThemedText style={styles.emailText}>{email}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
          <ThemedText style={styles.dateText}>Leaked: {formatDate(leakedDate)}</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={styles.changePasswordButton}>
        <MaterialIcons name="lock-reset" size={18} color="#EF4444" />
        <Text style={styles.changePasswordText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function LeakedPasswordsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    // Ensure the native header is hidden for this screen
    // some router/navigation setups may still show a header; force hide it
    (navigation as any)?.setOptions?.({ headerShown: false });
  }, [navigation]);
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <ThemedText style={styles.headerTitle}>Leaked Passwords</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <MaterialIcons name="warning" size={24} color="#EF4444" />
        <View style={styles.warningTextContainer}>
          <ThemedText style={styles.warningTitle}>Security Alert</ThemedText>
          <ThemedText style={styles.warningDescription}>
            These passwords have been found in data breaches. Change them immediately to protect your
            accounts.
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{LEAKED_PASSWORDS.length}</Text>
            <Text style={styles.statLabel}>Total Leaked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>
              {LEAKED_PASSWORDS.filter((p) => p.severity === 'high').length}
            </Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Affected Accounts</ThemedText>

        {LEAKED_PASSWORDS.map((password) => (
          <LeakedPasswordItem
            key={password.id}
            website={password.website}
            email={password.email}
            leakedDate={password.leakedDate}
            severity={password.severity}
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
    color: '#EF4444',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FECACA',
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
    color: '#991B1B',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    color: '#7F1D1D',
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
    borderColor: '#FEE2E2',
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
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
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
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  changePasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
  },
});

