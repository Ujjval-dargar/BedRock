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
    const rootNode = rootRef.current ? findNodeHandle(rootRef.current) : null;
    const node = buttonRef ? findNodeHandle(buttonRef) : null;
    if (!node || !rootNode) return;

    UIManager.measureLayout(
      node,
      rootNode,
      () => {},
      (left: number, top: number, width: number, height: number) => {
        const { height: screenH } = Dimensions.get('window');
        const menuWidth = 140;
        const menuHeight = 120;

        // Prefer showing menu below the button
        let xPos = Math.max(8, left + width - menuWidth);
        let yPos = top + height + 8;

        // If not enough space below, show above
        if (yPos + menuHeight > screenH - 16) {
          yPos = Math.max(8, top - menuHeight - 8);
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
      const decryptedPassword = aesDecrypt(item.encryptedPassword, vaultKey);
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
      <Text style={styles.header}>Recently Added</Text>
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
                <Text style={styles.itemName}>{item.name}</Text>
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
    paddingHorizontal: 20,
    marginTop: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 16,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 12,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
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
