import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BackButton from '@/components/back-button';
import { passwordAPI, storageAPI } from '@/utils/api';
import { aesDecrypt, validatePasswordStrength } from '@/utils/crypto';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

interface WeakPassword {
  id: number;
  website: string;
  email: string;
  foundDate: string;
  daysAgo: number;
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

export default function WeakPasswordsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [passwords, setPasswords] = useState<WeakPassword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({ headerShown: false });
    }
    fetchWeakPasswords();
  }, [navigation]);

  const fetchWeakPasswords = async () => {
    try {
      setLoading(true);
      const allPasswords = await passwordAPI.list();
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const weakPasswordsList: WeakPassword[] = [];
      
      for (const pwd of allPasswords) {
        try {
          const decrypted = await aesDecrypt(pwd.encrypted_password, vaultKey);
          const strength = validatePasswordStrength(decrypted);
          
          if (!strength.isStrong) {
            const createdDate = new Date(pwd.created_at || Date.now());
            const now = new Date();
            const daysAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            
            weakPasswordsList.push({
              id: pwd.id,
              website: pwd.title,
              email: pwd.username || 'No username',
              foundDate: pwd.created_at || new Date().toISOString(),
              daysAgo,
              category: pwd.category || 'Other',
            });
          }
        } catch (error) {
          console.error('Failed to decrypt password:', error);
        }
      }
      
      setPasswords(weakPasswordsList);
    } catch (error: any) {
      console.error('Failed to fetch passwords:', error);
      Alert.alert('Error', error.message || 'Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <ThemedView style={styles.safe}>
        <View style={styles.header}>
          <BackButton />
          <ThemedText style={styles.title}>Weak Passwords</ThemedText>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="hourglass-empty" size={64} color="#F59E0B" />
          <ThemedText style={{ marginTop: 16, color: '#666' }}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.safe}>
      <View style={styles.header}>
        <BackButton />
        <ThemedText style={styles.title}>Weak Passwords ({passwords.length})</ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}>
        {passwords.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="check-circle" size={64} color="#10B981" />
            <ThemedText style={styles.emptyTitle}>All Passwords Strong!</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Great job! All your passwords meet security standards.
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.warningBanner}>
              <MaterialIcons name="warning" size={24} color="#F59E0B" />
              <View style={styles.warningTextContainer}>
                <ThemedText style={styles.warningTitle}>Action Required</ThemedText>
                <ThemedText style={styles.warningDescription}>
                  These passwords are weak and should be updated immediately for better security.
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
                  <View style={styles.strengthBadge}>
                    <MaterialIcons name="warning" size={16} color="#F59E0B" />
                    <ThemedText style={styles.strengthText}>Weak</ThemedText>
                  </View>
                  <ThemedText style={styles.dateText}>{formatDate(pwd.foundDate)}</ThemedText>
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
    color: '#F59E0B',
  },
  content: {
    padding: 16,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
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
    color: '#F59E0B',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    color: '#D97706',
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
    borderLeftColor: '#F59E0B',
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
  strengthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
