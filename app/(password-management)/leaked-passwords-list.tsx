import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BackButton from '@/components/back-button';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';
import { passwordAPI, storageAPI } from '@/utils/api';
import { aesDecrypt } from '@/utils/crypto';
import * as Crypto from 'expo-crypto';

interface LeakedPassword {
  id: number;
  website: string;
  email: string;
  timesLeaked: number;
  foundDate: string;
  category: string;
}

function getCategoryDisplay(category?: string) {
  const cat = category || 'Other';
  const displays: Record<string, { icon: string; color: string; bg: string }> = {
    Browser: { icon: 'globe', color: '#3B82F6', bg: '#EFF6FF' },
    Social: { icon: 'users', color: '#EC4899', bg: '#FCE7F3' },
    Work: { icon: 'briefcase', color: '#8B5CF6', bg: '#F3E8FF' },
    Card: { icon: 'credit-card', color: '#10B981', bg: '#D1FAE5' },
    Email: { icon: 'envelope', color: '#F59E0B', bg: '#FEF3C7' },
    Other: { icon: 'th', color: '#6B7280', bg: '#F3F4F6' },
  };
  return displays[cat] || displays.Other;
}

// Check if password has been leaked using Have I Been Pwned API
async function checkPasswordLeak(password: string): Promise<number> {
  try {
    // Hash the password using SHA-1
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      password
    );
    const hashUpper = hash.toUpperCase();
    const prefix = hashUpper.substring(0, 5);
    const suffix = hashUpper.substring(5);

    // Query Have I Been Pwned API with k-Anonymity
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'Add-Padding': 'true', // Enhanced privacy
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check password');
    }

    const text = await response.text();
    const hashes = text.split('\n');

    // Check if our hash suffix is in the response
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return parseInt(count, 10);
      }
    }

    return 0; // Not found in breaches
  } catch (error) {
    console.error('Error checking password leak:', error);
    return 0; // Return 0 on error to avoid false positives
  }
}

export default function LeakedPasswordsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [passwords, setPasswords] = useState<LeakedPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({ headerShown: false });
    }
    fetchLeakedPasswords();
  }, [navigation]);

  const fetchLeakedPasswords = async () => {
    try {
      setLoading(true);
      setChecking(true);
      const allPasswords = await passwordAPI.list();
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const leakedPasswordsList: LeakedPassword[] = [];
      
      // Check each password against Have I Been Pwned
      for (const pwd of allPasswords) {
        try {
          const decrypted = await aesDecrypt(pwd.encrypted_password, vaultKey);
          const leakCount = await checkPasswordLeak(decrypted);
          
          if (leakCount > 0) {
            leakedPasswordsList.push({
              id: pwd.id,
              website: pwd.title,
              email: pwd.username || 'No username',
              timesLeaked: leakCount,
              foundDate: pwd.created_at || new Date().toISOString(),
              category: pwd.category || 'Other',
            });
          }
        } catch (error) {
          console.error('Failed to check password:', error);
        }
      }
      
      setPasswords(leakedPasswordsList);
    } catch (error: any) {
      console.error('Failed to fetch passwords:', error);
      Alert.alert('Error', error.message || 'Failed to check passwords');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  const formatLeakCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <ThemedView style={styles.safe}>
        <View style={styles.header}>
          <BackButton />
          <ThemedText style={styles.title}>Leaked Passwords</ThemedText>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EF4444" />
          <ThemedText style={{ marginTop: 16, color: '#666' }}>Checking passwords...</ThemedText>
          <ThemedText style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            This may take a moment
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.safe}>
      <View style={styles.header}>
        <BackButton />
        <ThemedText style={styles.title}>Leaked Passwords ({passwords.length})</ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}>
        {passwords.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="security" size={64} color="#10B981" />
            <ThemedText style={styles.emptyTitle}>No Leaked Passwords Detected</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Great! None of your passwords appear in known data breaches.
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.warningBanner}>
              <MaterialIcons name="error" size={24} color="#EF4444" />
              <View style={styles.warningTextContainer}>
                <ThemedText style={styles.warningTitle}>Critical Security Risk</ThemedText>
                <ThemedText style={styles.warningDescription}>
                  These passwords have been exposed in data breaches. Change them immediately!
                </ThemedText>
              </View>
            </View>
            {passwords.map((pwd) => {
              const categoryDisplay = getCategoryDisplay(pwd.category);
              return (
              <TouchableOpacity
                key={pwd.id}
                style={styles.card}
                onPress={() => router.push({
                  pathname: '/view-password-details',
                  params: { id: pwd.id }
                })}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: categoryDisplay.bg }]}>
                    <FontAwesome name={categoryDisplay.icon as any} size={24} color={categoryDisplay.color} />
                  </View>
                  <View style={styles.textContainer}>
                    <ThemedText style={styles.website}>{pwd.website}</ThemedText>
                    <ThemedText style={styles.email}>{pwd.email}</ThemedText>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.leakBadge}>
                    <MaterialIcons name="error" size={16} color="#EF4444" />
                    <ThemedText style={styles.leakText}>
                      Seen {formatLeakCount(pwd.timesLeaked)} times
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F6FB',
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
  },
  content: {
    padding: 16,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    color: '#991B1B',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  website: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  leakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
});

