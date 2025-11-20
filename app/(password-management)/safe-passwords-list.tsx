import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, Alert } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BackButton from '@/components/back-button';
import { getWebsiteIcon, iconImageMap } from '@/utils/website-icons';
import { passwordAPI, storageAPI } from '@/utils/api';
import { aesDecrypt, validatePasswordStrength } from '@/utils/crypto';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

interface SafePassword {
  id: number;
  website: string;
  email: string;
  lastUpdated: string;
  strength: string;
}

export default function SafePasswordsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [passwords, setPasswords] = useState<SafePassword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({ headerShown: false });
    }
    fetchSafePasswords();
  }, [navigation]);

  const fetchSafePasswords = async () => {
    try {
      setLoading(true);
      const allPasswords = await passwordAPI.list();
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      const safePasswordsList: SafePassword[] = [];
      
      for (const pwd of allPasswords) {
        try {
          const decrypted = await aesDecrypt(pwd.encrypted_password, vaultKey);
          const strength = validatePasswordStrength(decrypted);
          
          if (strength.isStrong) {
            safePasswordsList.push({
              id: pwd.id,
              website: pwd.title,
              email: pwd.username || 'No username',
              lastUpdated: pwd.created_at || new Date().toISOString(),
              strength: 'strong',
            });
          }
        } catch (error) {
          console.error('Failed to decrypt password:', error);
        }
      }
      
      setPasswords(safePasswordsList);
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
          <ThemedText style={styles.title}>Safe Passwords</ThemedText>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="hourglass-empty" size={64} color="#10B981" />
          <ThemedText style={{ marginTop: 16, color: '#666' }}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.safe}>
      <View style={styles.header}>
        <BackButton />
        <ThemedText style={styles.title}>Safe Passwords ({passwords.length})</ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}>
        {passwords.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="security" size={64} color="#6B5BFF" />
            <ThemedText style={styles.emptyTitle}>No Safe Passwords</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              All your passwords appear to be weak. Consider updating them to stronger ones.
            </ThemedText>
          </View>
        ) : (
          passwords.map((pwd) => (
            <TouchableOpacity
              key={pwd.id}
              style={styles.card}
              onPress={() => router.push({
                pathname: '/view-password-details',
                params: { id: pwd.id }
              })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Image
                    source={iconImageMap[getWebsiteIcon(pwd.website).imagePath || 'default']}
                    style={styles.icon}
                  />
                </View>
                <View style={styles.textContainer}>
                  <ThemedText style={styles.website}>{pwd.website}</ThemedText>
                  <ThemedText style={styles.email}>{pwd.email}</ThemedText>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.strengthBadge}>
                  <MaterialIcons name="lock" size={16} color="#10B981" />
                  <ThemedText style={styles.strengthText}>Strong</ThemedText>
                </View>
                <ThemedText style={styles.dateText}>{formatDate(pwd.lastUpdated)}</ThemedText>
              </View>
            </TouchableOpacity>
          ))
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
    color: '#10B981',
  },
  content: {
    padding: 16,
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
    color: '#6B5BFF',
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
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    width: 32,
    height: 32,
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
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

