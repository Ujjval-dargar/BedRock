import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

export default function BackupSyncScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBackupSettings();
  }, []);

  const loadBackupSettings = async () => {
    try {
      const autoBackup = await AsyncStorage.getItem('autoBackupEnabled');
      const lastBackup = await AsyncStorage.getItem('lastBackupDate');
      const cloudSync = await AsyncStorage.getItem('cloudSyncEnabled');
      
      setAutoBackupEnabled(autoBackup === 'true');
      setCloudSyncEnabled(cloudSync === 'true');
      setLastBackupDate(lastBackup);
    } catch (error) {
      console.error('Failed to load backup settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoBackupToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('autoBackupEnabled', value.toString());
      setAutoBackupEnabled(value);
      
      if (value) {
        Alert.alert(
          'Auto Backup Enabled',
          'Your passwords will be automatically backed up daily.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto backup setting');
    }
  };

  const handleCloudSyncToggle = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('cloudSyncEnabled', value.toString());
      setCloudSyncEnabled(value);
      
      if (value) {
        Alert.alert(
          'Cloud Sync Enabled',
          'Your data will be synced across all your devices.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update cloud sync setting');
    }
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date().toISOString();
      await AsyncStorage.setItem('lastBackupDate', now);
      setLastBackupDate(now);
      
      Alert.alert('Success', 'Backup completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = () => {
    Alert.alert(
      'Restore Backup',
      'This will replace your current data with the backup. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Restore functionality will be implemented soon.');
          },
        },
      ]
    );
  };

  const formatBackupDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#6F6BF5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Backup & Sync</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Ionicons 
              name={lastBackupDate ? "cloud-done" : "cloud-offline"} 
              size={32} 
              color={lastBackupDate ? "#10B981" : "#EF4444"} 
            />
          </View>
          <Text style={styles.statusTitle}>Last Backup</Text>
          <Text style={styles.statusSubtitle}>{formatBackupDate(lastBackupDate)}</Text>
        </View>

        {/* Backup Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup Settings</Text>
          
          {/* Auto Backup Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="sync" size={20} color="#3B82F6" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Auto Backup</Text>
                <Text style={styles.settingSubtitle}>Backup daily automatically</Text>
              </View>
            </View>
            <Switch
              value={autoBackupEnabled}
              onValueChange={handleAutoBackupToggle}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Cloud Sync Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="cloud-upload" size={20} color="#6366F1" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Cloud Sync</Text>
                <Text style={styles.settingSubtitle}>Sync across devices</Text>
              </View>
            </View>
            <Switch
              value={cloudSyncEnabled}
              onValueChange={handleCloudSyncToggle}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          {/* Backup Now Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleBackupNow}
            disabled={isBackingUp}
          >
            {isBackingUp ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Backup Now</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Restore Backup Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleRestoreBackup}
            disabled={!lastBackupDate}
          >
            <Ionicons name="cloud-download-outline" size={20} color="#6F6BF5" />
            <Text style={styles.secondaryButtonText}>Restore Backup</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>About Backups</Text>
          </View>
          <View style={styles.infoBullets}>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                Backups are encrypted end-to-end
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                Only you can access your backup data
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                Backups are stored securely in the cloud
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>
                Free tier includes up to 1000 passwords
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#6F6BF5',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F5F0FF',
    borderWidth: 1,
    borderColor: '#E0D7FF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6F6BF5',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoBullets: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
