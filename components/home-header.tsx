import { StyleSheet, View, Pressable, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { authAPI } from '../utils/api';

interface HomeHeaderProps {
  onProfilePress: () => void;
}

export function HomeHeader({ onProfilePress }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [username, setUsername] = useState('User');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await authAPI.getMe();
      setUsername(user.username);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Pressable style={styles.userChip} onPress={onProfilePress}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={20} color="#64B5F6" />
        </View>
        <Text style={styles.userName}>{username}</Text>
      </Pressable>
      <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
        <MaterialIcons name="settings" size={24} color="#333" />
      </Pressable>
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
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
