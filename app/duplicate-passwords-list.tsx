import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, Alert } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BackButton from '@/components/back-button';
import { getWebsiteIcon, iconImageMap } from '@/utils/website-icons';
import { passwordAPI, storageAPI } from '@/utils/api';
import { aesDecrypt } from '@/utils/crypto';

interface DuplicatePassword {
  id: number;
  website: string;
  email: string;
  foundDate: string;
}

interface PasswordGroup {
  password: string;
  accounts: DuplicatePassword[];
}

export default function DuplicatePasswordsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [duplicateGroups, setDuplicateGroups] = useState<PasswordGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({ headerShown: false });
    }
    fetchDuplicatePasswords();
  }, [navigation]);

  const fetchDuplicatePasswords = async () => {
    try {
      setLoading(true);
      const allPasswords = await passwordAPI.list();
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      // Map to track password occurrences
      const passwordMap = new Map<string, DuplicatePassword[]>();
      
      for (const pwd of allPasswords) {
        try {
          const decrypted = await aesDecrypt(pwd.encrypted_password, vaultKey);
          
          if (!passwordMap.has(decrypted)) {
            passwordMap.set(decrypted, []);
          }
          
          passwordMap.get(decrypted)!.push({
            id: pwd.id,
            website: pwd.title,
            email: pwd.username || 'No username',
            foundDate: pwd.created_at || new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to decrypt password:', error);
        }
      }
      
      // Filter only duplicates (password used in 2+ accounts)
      const groups: PasswordGroup[] = [];
      passwordMap.forEach((accounts, password) => {
        if (accounts.length > 1) {
          groups.push({ password, accounts });
        }
      });
      
      setDuplicateGroups(groups);
    } catch (error: any) {
      console.error('Failed to fetch passwords:', error);
      Alert.alert('Error', error.message || 'Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.safe}>
        <View style={styles.header}>
          <BackButton />
          <ThemedText style={styles.title}>Duplicate Passwords</ThemedText>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="hourglass-empty" size={64} color="#8B5CF6" />
          <ThemedText style={{ marginTop: 16, color: '#666' }}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.accounts.length, 0);

  return (
    <ThemedView style={styles.safe}>
      <View style={styles.header}>
        <BackButton />
        <ThemedText style={styles.title}>Duplicate Passwords ({totalDuplicates})</ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {duplicateGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="check-circle" size={64} color="#10B981" />
            <ThemedText style={styles.emptyTitle}>No Duplicate Passwords</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Great! Each password is unique to its account.
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.warningBanner}>
              <MaterialIcons name="content-copy" size={24} color="#8B5CF6" />
              <View style={styles.warningTextContainer}>
                <ThemedText style={styles.warningTitle}>Reused Passwords Detected</ThemedText>
                <ThemedText style={styles.warningDescription}>
                  Using the same password for multiple accounts increases security risk. Consider using unique passwords.
                </ThemedText>
              </View>
            </View>
            {duplicateGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.duplicateGroup}>
                <View style={styles.groupHeader}>
                  <MaterialIcons name="vpn-key" size={20} color="#8B5CF6" />
                  <ThemedText style={styles.groupTitle}>
                    Used in {group.accounts.length} accounts
                  </ThemedText>
                </View>
                {group.accounts.map((pwd) => (
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
                  </TouchableOpacity>
                ))}
              </View>
            ))}
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
    color: '#8B5CF6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#EDE9FE',
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
    color: '#8B5CF6',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    color: '#6B21A8',
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
  duplicateGroup: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

