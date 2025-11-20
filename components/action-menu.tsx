import { StyleSheet, View, Pressable, Text, Modal } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  position?: { x: number; y: number } | null;
}

export function ActionMenu({ visible, onClose, onEdit, onDelete, position }: ActionMenuProps) {
  if (!visible || !position) return null;

  const handleEdit = () => {
    onClose();
    onEdit?.();
  };

  const handleDelete = () => {
    onClose();
    onDelete?.();
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <View style={styles.fullscreen} pointerEvents="box-none">
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.menu, { left: position.x, top: position.y }]}> 
          <Pressable style={styles.item} onPress={handleEdit}>
            <MaterialIcons name="edit" size={18} color="#333" />
            <Text style={styles.label}>Edit</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={handleDelete}>
            <MaterialIcons name="delete" size={18} color="#e53935" />
            <Text style={[styles.label, { color: '#e53935' }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  item: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
});
