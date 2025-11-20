import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  View as RNView,
  Alert,
  ActivityIndicator,
  findNodeHandle,
  UIManager,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { passwordAPI, PasswordEntry, storageAPI } from '../../utils/api';
import { aesDecrypt, validatePasswordStrength } from '../../utils/crypto';
import { ActionMenu } from '@/components/action-menu';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

type PasswordItem = {
  id: number;
  name: string;
  email: string;
  category: string;
  icon: string;
  iconColor: string;
  status?: 'warning' | 'safe';
  encryptedPassword: string;
  notes?: string;
};

const categories = ['All', 'Browser', 'Social', 'Work', 'Card', 'Email', 'Other'];

// Helper to map category and get icon/color
function getCategoryDisplay(category?: string) {
  const cat = category || 'Other';
  const displays: Record<string, { icon: string; color: string }> = {
    Browser: { icon: 'globe', color: '#3B82F6' },
    Social: { icon: 'people', color: '#EC4899' },
    Work: { icon: 'briefcase', color: '#8B5CF6' },
    Card: { icon: 'card', color: '#10B981' },
    Email: { icon: 'mail', color: '#F59E0B' },
    Other: { icon: 'apps', color: '#6B7280' },
  };
  return displays[cat] || displays.Other;
}

// Convert backend PasswordEntry to PasswordItem
function mapPasswordEntry(entry: PasswordEntry): PasswordItem {
  const category = entry.category || 'Other';
  const display = getCategoryDisplay(category);
  return {
    id: entry.id,
    name: entry.title,
    email: entry.username || 'No username',
    category: category,
    icon: display.icon,
    iconColor: display.color,
    status: 'safe',
    encryptedPassword: entry.encrypted_password,
    notes: entry.notes,
  };
}

const PasswordCard = ({ 
  item, 
  onPress, 
  onMenuPress, 
  menuButtonRef 
}: { 
  item: PasswordItem; 
  onPress: () => void;
  onMenuPress: () => void;
  menuButtonRef: (ref: any) => void;
}) => {
  const isWarning = item.status === 'warning';
  
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.cardIconContainer, { backgroundColor: `${item.iconColor}15` }]}>
        <FontAwesome name={item.icon as any} size={24} color={item.iconColor} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {isWarning && (
            <View style={styles.warningBadge}>
              <Ionicons name="warning" size={12} color="#DC2626" />
            </View>
          )}
        </View>
        <Text style={styles.cardEmail}>{item.email}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: `${item.iconColor}15` }]}>
            <Text style={[styles.categoryText, { color: item.iconColor }]}>{item.category}</Text>
          </View>
          <View style={styles.strengthIndicator}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  i <= (isWarning ? 2 : 4) && {
                    backgroundColor: isWarning ? '#F59E0B' : '#10B981',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <RNView
        ref={menuButtonRef}
        collapsable={false}
      >
        <Pressable 
          style={styles.moreButton} 
          onPress={onMenuPress}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
        </Pressable>
      </RNView>
    </Pressable>
  );
};

const StatCard = ({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function VaultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [passwordItems, setPasswordItems] = useState<PasswordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const buttonRefs = useRef<{ [key: number]: any }>({});
  const rootRef = useRef<any>(null);
  const categoryScrollRef = useRef<any>(null);

  // Handle filter parameter from category cards
  useEffect(() => {
    if (params.filter && typeof params.filter === 'string') {
      setSelectedCategory(params.filter);
      // Scroll to the selected category
      setTimeout(() => {
        const categoryIndex = categories.indexOf(params.filter as string);
        if (categoryIndex !== -1 && categoryScrollRef.current) {
          // Scroll to make the selected category visible
          categoryScrollRef.current.scrollTo({
            x: Math.max(0, (categoryIndex - 1) * 90), // Adjust position to center the category
            animated: true
          });
        }
      }, 100);
      // Clear the filter parameter after applying it
      router.setParams({ filter: undefined } as any);
    }
  }, [params.filter, router]);

  // Fetch passwords from backend
  const fetchPasswords = async () => {
    try {
      const entries = await passwordAPI.list();
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        Alert.alert('Error', 'Please login again');
        setPasswordItems([]);
        return;
      }

      const items: PasswordItem[] = [];
      
      for (const entry of entries) {
        try {
          const decrypted = await aesDecrypt(entry.encrypted_password, vaultKey);
          const strength = validatePasswordStrength(decrypted);
          const category = entry.category || 'Other';
          const display = getCategoryDisplay(category);
          
          items.push({
            id: entry.id,
            name: entry.title,
            email: entry.username || 'No username',
            category: category,
            icon: display.icon,
            iconColor: display.color,
            status: strength.isStrong ? 'safe' : 'warning',
            encryptedPassword: entry.encrypted_password,
            notes: entry.notes,
          });
        } catch (error) {
          console.error(`Failed to decrypt password ${entry.id}:`, error);
        }
      }
      
      setPasswordItems(items);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load passwords');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  // Refresh when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      fetchPasswords();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPasswords();
  };

  const filteredItems = passwordItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPasswords = passwordItems.length;
  const weakPasswords = passwordItems.filter((item) => item.status === 'warning').length;
  const strongPasswords = totalPasswords - weakPasswords;

  const handlePasswordPress = (id: number) => {
    router.push(`/(password-management)/view-password-details?id=${id}` as any);
  };

  const handleAddPassword = () => {
    router.push('/(password-management)/add-password' as any);
  };

  const handleMenuPress = (id: number) => {
    const buttonRef = buttonRefs.current[id];
    const node = buttonRef ? findNodeHandle(buttonRef) : null;
    if (!node) return;

    // Measure in window coordinates so menu renders correctly inside a Modal and above nav bars
    UIManager.measureInWindow(
      node,
      (left: number, top: number, width: number, height: number) => {
        const { height: screenH, width: screenW } = Dimensions.get('window');
        const menuWidth = 140;
        const menuHeight = 120;
        const bottomNavHeight = 90; // Height of bottom navigation bar
        const buttonBottom = top + height;
        const menuBottom = buttonBottom + 4 + menuHeight; // Where menu would end if positioned below

        let xPos: number;
        let yPos: number;

        // Check if menu would actually overlap with nav bar (only trigger special positioning if needed)
        if (menuBottom > screenH - bottomNavHeight) {
          // Position menu aligned with button's right edge, just above nav bar
          xPos = left + width - menuWidth; // Align menu's right edge with button's right edge
          yPos = top + height + 4; // Just below the button
          
          // If menu would overlap with nav bar even at this position, move it up
          if (yPos + menuHeight > screenH - bottomNavHeight) {
            yPos = screenH - bottomNavHeight - menuHeight - 4;
          }
          
          // Keep menu in bounds
          if (xPos < 8) xPos = 8;
          if (yPos < 8) yPos = 8;
        } else {
          // Standard positioning: below button, aligned to right
          xPos = left + width - menuWidth;
          yPos = top + height + 4;

          // Make sure menu doesn't go off screen to the left
          if (xPos < 8) xPos = 8;

          // If not enough space below, show above
          if (yPos + menuHeight > screenH - bottomNavHeight - 8) {
            yPos = Math.max(8, top - menuHeight - 8);
          }
        }

        setMenuPosition({ x: xPos, y: yPos });
        setSelectedItemId(id);
        setMenuVisible(true);
      }
    );
  };

  const handleEdit = () => {
    if (selectedItemId !== null) {
      setMenuVisible(false);
      router.push(`/(password-management)/edit-password-details?id=${encodeURIComponent(selectedItemId)}` as any);
    }
  };

  const handleDelete = async () => {
    if (selectedItemId !== null) {
      const item = passwordItems.find(p => p.id === selectedItemId);
      if (!item) return;
      
      setMenuVisible(false);
      Alert.alert(
        'Delete Password',
        `Are you sure you want to delete "${item.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await passwordAPI.delete(item.id);
                await fetchPasswords(); // Refresh the list
                Alert.alert('Success', 'Password deleted successfully');
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to delete password');
              }
            },
          },
        ]
      );
    }
  };

  const SAView: any = SafeAreaView;

  return (
    <SAView style={styles.safe} edges={['top']} ref={rootRef}>
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>My Vault</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B5BFF" />
            <Text style={styles.loadingText}>Loading your vault...</Text>
          </View>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <StatCard icon="key" value={`${totalPasswords}`} label="Total" color="#6B5BFF" />
              <StatCard icon="shield-checkmark" value={`${strongPasswords}`} label="Strong" color="#10B981" />
              <StatCard icon="warning" value={`${weakPasswords}`} label="Weak" color="#F59E0B" />
            </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search passwords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/shared-passwords-list' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="share-social" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Shared</Text>
              <Text style={styles.quickActionSubtitle}>View shared passwords</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/weak-passwords-list' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Weak Passwords</Text>
              <Text style={styles.quickActionSubtitle}>{weakPasswords} need attention</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Passwords List */}
        <View style={styles.passwordsSection}>
          <Text style={styles.sectionTitle}>
            All Passwords ({filteredItems.length})
          </Text>
          
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <PasswordCard
                key={item.id}
                item={item}
                onPress={() => handlePasswordPress(item.id)}
                onMenuPress={() => handleMenuPress(item.id)}
                menuButtonRef={(ref: any) => {
                  buttonRefs.current[item.id] = ref;
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No passwords found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try a different search term' : 'Add your first password to get started'}
              </Text>
            </View>
          )}
        </View>
          </>
        )}
      </ScrollView>

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        position={menuPosition}
      />
    </SAView>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#6B5BFF',
    borderColor: '#6B5BFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  quickActions: {
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  passwordsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  warningBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  cardEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: '#F0EDFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B5BFF',
  },
  strengthIndicator: {
    flexDirection: 'row',
    gap: 3,
  },
  strengthBar: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  moreButton: {
    padding: 12,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
    paddingBottom: 200,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
