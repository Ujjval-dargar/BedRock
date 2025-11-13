import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type SettingsItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  iconFamily: 'Ionicons' | 'MaterialIcons' | 'MaterialCommunityIcons';
  title: string;
  type: 'arrow' | 'toggle';
  toggleValue?: boolean;
  accentColor: string;
  accentBackground: string;
};

const settingsItems: SettingsItem[] = [
  {
    id: 'account-security',
    icon: 'lock-closed-outline',
    iconFamily: 'Ionicons',
    title: 'Account Security',
    type: 'arrow',
    accentColor: '#3B82F6',
    accentBackground: '#E0EDFF',
  },
  {
    id: 'auto-fill',
    icon: 'checkmark-circle-outline',
    iconFamily: 'Ionicons',
    title: 'Auto Fill',
    type: 'toggle',
    toggleValue: true,
    accentColor: '#10B981',
    accentBackground: '#DCFCE7',
  },
  {
    id: 'vault',
    icon: 'eye-outline',
    iconFamily: 'Ionicons',
    title: 'Vault',
    type: 'arrow',
    accentColor: '#6366F1',
    accentBackground: '#E5E7FF',
  },
  {
    id: 'help-support',
    icon: 'help-circle-outline',
    iconFamily: 'Ionicons',
    title: 'Help & Support',
    type: 'arrow',
    accentColor: '#F59E0B',
    accentBackground: '#FEF3C7',
  },
  {
    id: 'biometric',
    icon: 'fingerprint',
    iconFamily: 'MaterialIcons',
    title: 'Add Biometric',
    type: 'arrow',
    accentColor: '#F472B6',
    accentBackground: '#FCE7F3',
  },
  {
    id: 'about',
    icon: 'help-outline',
    iconFamily: 'MaterialIcons',
    title: 'About',
    type: 'arrow',
    accentColor: '#14B8A6',
    accentBackground: '#CCFBF1',
  },
];

type SettingsItemRowProps = {
  item: SettingsItem;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
};

const SettingsItemRow = ({ item, toggleValue, onToggleChange }: SettingsItemRowProps) => {
  const renderIcon = () => {
    const iconSize = 20;

    if (item.iconFamily === 'Ionicons') {
      return <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={iconSize} color={item.accentColor} />;
    }
    if (item.iconFamily === 'MaterialIcons') {
      return <MaterialIcons name={item.icon as keyof typeof MaterialIcons.glyphMap} size={iconSize} color={item.accentColor} />;
    }
    return <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={iconSize} color={item.accentColor} />;
  };

  const subtitleMap: Record<string, string> = {
    'account-security': 'Passwords, privacy & recovery',
    'auto-fill': 'Fill forms & passwords automatically',
    vault: 'Keep important data protected',
    'help-support': 'FAQs, chat & tutorials',
    biometric: 'Unlock faster with biometrics',
    about: 'Version details & legal',
  };

  return (
    <TouchableOpacity style={styles.settingsItem} activeOpacity={0.8}>
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.accentBackground }]}> 
          {renderIcon()}
        </View>
        <View style={styles.settingsTextGroup}>
          <Text style={styles.settingsItemText}>{item.title}</Text>
          <Text style={styles.settingsItemSubtitle}>{subtitleMap[item.id]}</Text>
        </View>
      </View>
      {item.type === 'arrow' ? (
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={22} color="#A1A1AA" />
        </View>
      ) : (
        <View style={styles.switchContainer}>
          <Switch
            value={toggleValue ?? false}
            onValueChange={onToggleChange}
            trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
            thumbColor={Platform.OS === 'ios' ? undefined : '#4F46E5'}
            ios_backgroundColor="#D1D5DB"
            style={styles.switch}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const profileInitials = useMemo(() => 'Stephen Johnson'.split(' ').map((part) => part[0]).join(''), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <TouchableOpacity activeOpacity={0.85} style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.pageTitle}>Settings</Text>
            <Text style={styles.pageSubtitle}>Fine-tune your security and experience</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>{profileInitials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Stephen Johnson</Text>
              <Text style={styles.profileMeta}>Premium Plan · Active since 2021</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.manageButton}>
              <Text style={styles.manageButtonText}>Manage</Text>
              <Ionicons name="chevron-forward" size={16} color="#4C1D95" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>General</Text>
            <Text style={styles.sectionSubtitle}>Customize how your vault behaves and feels.</Text>
          </View>

          <View style={styles.settingsList}>
            {settingsItems.map((item, index) => (
              <View key={item.id} style={styles.settingsRowWrapper}>
                <SettingsItemRow
                  item={item}
                  toggleValue={item.id === 'auto-fill' ? autoFillEnabled : undefined}
                  onToggleChange={item.id === 'auto-fill' ? setAutoFillEnabled : undefined}
                />
                {index < settingsItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F5FB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 24,
    gap: 28,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#DCE1FF',
    shadowColor: '#312E81',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
  },
  profileAvatar: {
    height: 64,
    width: 64,
    borderRadius: 20,
    backgroundColor: '#4C1D95',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  manageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4C1D95',
    marginRight: 4,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 3,
  },
  settingsRowWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
    flexShrink: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTextGroup: {
    flexShrink: 1,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingsItemSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  chevronContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 10,
  },
  switchContainer: {
    borderRadius: 20,
    padding: 2,
    backgroundColor: '#EEF2FF',
  },
  switch: {
    transform: Platform.OS === 'ios' ? [{ scaleX: 0.88 }, { scaleY: 0.88 }] : [{ scaleX: 1 }, { scaleY: 1 }],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: 76,
  },
});
