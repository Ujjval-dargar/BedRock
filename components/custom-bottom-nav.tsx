import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NavItem {
  name: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
}

const navItems: NavItem[] = [
  { name: 'home', label: 'Home', icon: 'home', route: '/(tabs)/index' },
  { name: 'vault', label: 'Vault', icon: 'lock-outline', route: '/(tabs)/vault' },
  { name: 'generator', label: 'Generator', icon: 'vpn-key', route: '/(tabs)/generator' },
  // Open the original analytics screen when tapping Risks
  { name: 'risks', label: 'Risks', icon: 'show-chart', route: '/(tabs)/analytics' },
];

const PRIMARY_COLOR = '#6F6BF5'; // Active tab color
const INACTIVE_COLOR = '#9E9E9E'; // Light gray
const FAB_SIZE = 56;
const NAV_BAR_HEIGHT = 70;

interface CustomBottomNavProps {
  onFABPress?: () => void;
}

export default function CustomBottomNav({ onFABPress }: CustomBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const isActive = (route: string) => {
    const currentTab = (segments[segments.length - 1] as string) || 'index';
    const routeTab = route.replace('/(tabs)/', '').replace('/', '');
    const normalizedPath = pathname?.replace(/\/$/, '') || '';
    const pathMatches = normalizedPath === route || normalizedPath.endsWith('/' + routeTab);

    if (routeTab === 'index') {
      return (
        currentTab === 'index' ||
        !currentTab ||
        currentTab.length === 0 ||
        normalizedPath === '/(tabs)' ||
        normalizedPath === '/(tabs)/' ||
        normalizedPath === '/(tabs)/index' ||
        normalizedPath === '' ||
        normalizedPath === '/'
      );
    }

    return currentTab === routeTab || pathMatches;
  };

  const handlePress = (route: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isActive(route)) {
      return;
    }

    if (route === '/(tabs)/index') {
      router.replace('/(tabs)/' as any);
    } else {
      router.push(route as any);
    }
  };

  const handleFABPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onFABPress) {
      onFABPress();
    } else {
      console.log('FAB pressed');
    }
  };

  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.navBar}>
        <View style={styles.leftSection}>
          {leftItems.map((item) => {
            const active = isActive(item.route);
            return (
              <Pressable
                key={item.name}
                onPress={() => handlePress(item.route)}
                style={styles.navItem}
              >
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={active ? PRIMARY_COLOR : INACTIVE_COLOR}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: active ? PRIMARY_COLOR : INACTIVE_COLOR },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.fabContainer}>
          <Pressable
            onPress={handleFABPress}
            style={styles.fab}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
          >
            <MaterialIcons name="add" size={28} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.rightSection}>
          {rightItems.map((item) => {
            const active = isActive(item.route);
            return (
              <Pressable
                key={item.name}
                onPress={() => handlePress(item.route)}
                style={styles.navItem}
              >
                <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={active ? PRIMARY_COLOR : INACTIVE_COLOR}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: active ? PRIMARY_COLOR : INACTIVE_COLOR },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: NAV_BAR_HEIGHT,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    position: 'relative',
  },
  leftSection: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    paddingRight: FAB_SIZE / 2,
  },
  rightSection: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    paddingLeft: FAB_SIZE / 2,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    flex: 1,
    maxWidth: 80,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -FAB_SIZE / 2,
    top: -FAB_SIZE / 2 + 8,
    zIndex: 10,
    width: FAB_SIZE,
    height: FAB_SIZE,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
