import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import { Pressable, View as RNView, StyleSheet, Text, View, findNodeHandle, UIManager, Dimensions, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { ActionMenu } from './action-menu';
import { passwordAPI, PasswordEntry } from '../utils/api';
import { aesDecrypt } from '../utils/crypto';
import { storageAPI } from '../utils/api';

interface RecentlyAddedItem {
  id: number;
  name: string;
  timeAgo: string;
  backgroundColor: string;
  iconColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  encryptedPassword: string;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getIconForCategory(category: string): { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string } {
  const categoryMap: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
    'Browser': { icon: 'globe', color: '#3B82F6', bg: '#DBEAFE' },
    'Social': { icon: 'people', color: '#EC4899', bg: '#FCE7F3' },
    'Work': { icon: 'briefcase', color: '#8B5CF6', bg: '#EDE9FE' },
    'Card': { icon: 'card', color: '#10B981', bg: '#D1FAE5' },
    'Email': { icon: 'mail', color: '#F59E0B', bg: '#FEF3C7' },
    'Other': { icon: 'apps', color: '#6B7280', bg: '#F3F4F6' },
  };

  return categoryMap[category] || categoryMap['Other'];
}

export function RecentlyAdded() {
  const router = useRouter();
  const [items, setItems] = useState<RecentlyAddedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const buttonRefs = useRef<{ [key: number]: any }>({});
  const rootRef = useRef<any>(null);

  useEffect(() => {
    fetchRecentPasswords();
  }, []);

  const fetchRecentPasswords = async () => {
    try {
      setLoading(true);
      const passwords = await passwordAPI.list();
      
      // Sort by created_at and take top 3
      const sorted = passwords.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      }).slice(0, 3);
      
      const recentItems: RecentlyAddedItem[] = sorted.map((pwd) => {
        const iconData = getIconForCategory(pwd.category || 'Other');
        return {
          id: pwd.id,
          name: pwd.title,
          timeAgo: getTimeAgo(pwd.created_at || new Date().toISOString()),
          backgroundColor: iconData.bg,
          iconColor: iconData.color,
          icon: iconData.icon,
          encryptedPassword: pwd.encrypted_password,
        };
      });
      
      setItems(recentItems);
    } catch (error: any) {
      console.error('Failed to fetch recent passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuPress = (index: number) => {
    const buttonRef = buttonRefs.current[index];
    const node = buttonRef ? findNodeHandle(buttonRef) : null;
    if (!node) return;

    // Measure button in window coordinates so menu can be rendered in a top-level Modal
    UIManager.measureInWindow(
      node,
      (left: number, top: number, width: number, height: number) => {
        const { width: screenW, height: screenH } = Dimensions.get('window');
        const menuWidth = 140;
        const menuHeight = 120;
        const bottomNavHeight = 90; // Height of bottom navigation bar
        const buttonBottom = top + height;
        const menuBottom = buttonBottom + 8 + menuHeight; // Where menu would end if positioned below

        let xPos: number;
        let yPos: number;

        // Check if menu would actually overlap with nav bar (only trigger special positioning if needed)
        if (menuBottom > screenH - bottomNavHeight) {
          // Position menu to the LEFT of the button, aligned with button's right edge at top
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
          yPos = top + height + 8;

          // Keep menu inside horizontal bounds
          if (xPos < 8) xPos = left;
          if (xPos + menuWidth > screenW - 8) {
            xPos = Math.max(8, screenW - menuWidth - 8);
          }

          // If not enough space below, show above
          if (yPos + menuHeight > screenH - bottomNavHeight - 8) {
            yPos = Math.max(8, top - menuHeight - 8);
          }
        }

        setMenuPosition({ x: xPos, y: yPos });
        setSelectedItemIndex(index);
        setMenuVisible(true);
      }
    );
  };

  const handleEdit = () => {
    if (selectedItemIndex !== null) {
      const id = items[selectedItemIndex].id;
      router.push(`/(password-management)/edit-password-details?id=${encodeURIComponent(id)}` as any);
    }
  };

  const handleDelete = async () => {
    if (selectedItemIndex !== null) {
      const item = items[selectedItemIndex];
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
                await fetchRecentPasswords(); // Refresh the list
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

  const handleCopy = async (index: number) => {
    try {
      const item = items[index];
      const vaultKey = await storageAPI.getVaultKey();
      
      if (!vaultKey) {
        Alert.alert('Error', 'Vault key not found. Please login again.');
        return;
      }
      
      // Decrypt the password
      const decryptedPassword = await aesDecrypt(item.encryptedPassword, vaultKey);
      await Clipboard.setStringAsync(decryptedPassword);
      Alert.alert('Copied', 'Password copied to clipboard');
    } catch (error: any) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy password');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Recently Added</Text>
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6F6BF5" />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Recently Added</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No passwords yet</Text>
          <Text style={styles.emptySubtext}>Add your first password to see it here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} ref={rootRef as any}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Recently Added</Text>
        <Ionicons name="time-outline" size={20} color="#6B72FF" />
      </View>
      <View style={styles.list}>
        {items.map((item, index) => {
          return (
            <Pressable
              key={item.id}
              style={[styles.item, { backgroundColor: item.backgroundColor }]}
              onPress={() => router.push(`/(password-management)/view-password-details?id=${encodeURIComponent(item.id)}`)}
            >
              <View style={styles.iconWrapper}>
                <View style={[styles.iconContainer, { backgroundColor: item.iconColor }]}>
                  <Ionicons name={item.icon} size={28} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemTime}>{item.timeAgo}</Text>
              </View>
              <View style={styles.itemActions}>
                <Pressable style={styles.actionButton} onPress={() => handleCopy(index)}>
                  <Ionicons name="copy-outline" size={20} color="#666" />
                </Pressable>
                <RNView
                  ref={(ref: any) => {
                    buttonRefs.current[index] = ref;
                  }}
                  collapsable={false}
                >
                  <Pressable style={styles.actionButton} onPress={() => handleMenuPress(index)}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                  </Pressable>
                </RNView>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ActionMenu
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false);
          setSelectedItemIndex(null);
          setMenuPosition(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        position={menuPosition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});
