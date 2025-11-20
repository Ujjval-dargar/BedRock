import { StyleSheet, View, Pressable, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface HomeHeaderProps {
  onProfilePress: () => void;
  username?: string;
}

export function HomeHeader({ onProfilePress, username = 'User' }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.brandContainer}>
        <View style={styles.logoCircle}>
          <MaterialIcons name="lock" size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.brandName}>BedRock</Text>
      </View>
      <View style={styles.rightActions}>
        <Pressable style={styles.userButton} onPress={onProfilePress}>
          <MaterialIcons name="person" size={24} color="#6F6BF5" />
        </Pressable>
        <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <MaterialIcons name="settings" size={24} color="#333" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6F6BF5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6F6BF5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6F6BF5',
    letterSpacing: 0.5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0FF',
    borderRadius: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
