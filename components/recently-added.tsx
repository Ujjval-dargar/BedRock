import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRef, useState } from 'react';
import { Pressable, View as RNView, StyleSheet, Text, View, findNodeHandle, UIManager, Dimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { ActionMenu } from './action-menu';

interface RecentlyAddedItem {
  name: string;
  timeAgo: string;
  backgroundColor: string;
  iconColor: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const items: RecentlyAddedItem[] = [
  {
    name: 'SnapChat',
    timeAgo: '3 days ago',
    backgroundColor: '#FBFBDA',
    iconColor: '#FFC107',
    icon: 'tag-faces',
  },
  {
    name: 'Instagram',
    timeAgo: '5 days ago',
    backgroundColor: '#FFEDFA',
    iconColor: '#E91E63',
    icon: 'camera-alt',
  },
  {
    name: 'Linkedin',
    timeAgo: '5 days ago',
    backgroundColor: '#D4E9FF',
    iconColor: '#0277BD',
    icon: 'business-center',
  },
];

export function RecentlyAdded() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const buttonRefs = useRef<{ [key: number]: any }>({});
  const rootRef = useRef<any>(null);

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
      const id = String(selectedItemIndex + 1);
      // navigate to edit-password route with id
      router.push(`/edit-password-details?id=${encodeURIComponent(id)}` as any);
    }
  };

  const handleDelete = () => {
    if (selectedItemIndex !== null) {
      console.log('Delete item:', items[selectedItemIndex].name);
    }
  };

  const handleCopy = async (index: number) => {
    const text = `Password for ${items[index].name}`;
    await Clipboard.setStringAsync(text);
    console.log('Copied to clipboard:', text);
  };

  return (
    <View style={styles.container} ref={rootRef as any}>
      <Text style={styles.header}>Recently Added</Text>
      <View style={styles.list}>
        {items.map((item, index) => {
          const id = String(index + 1);
          return (
            <Pressable
              key={index}
              style={[styles.item, { backgroundColor: item.backgroundColor }]}
              onPress={() => router.push(`/view-password-details?id=${encodeURIComponent(id)}`)}
            >
              <View style={styles.iconWrapper}>
                <View style={[styles.iconContainer, { backgroundColor: item.iconColor }]}>
                  <MaterialIcons name={item.icon} size={28} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemTime}>{item.timeAgo}</Text>
              </View>
              <View style={styles.itemActions}>
                <Pressable style={styles.actionButton} onPress={() => handleCopy(index)}>
                  <MaterialIcons name="content-copy" size={20} color="#666" />
                </Pressable>
                <RNView
                  ref={(ref: any) => {
                    buttonRefs.current[index] = ref;
                  }}
                  collapsable={false}
                >
                  <Pressable style={styles.actionButton} onPress={() => handleMenuPress(index)}>
                    <MaterialIcons name="more-vert" size={20} color="#666" />
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
});
