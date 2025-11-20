import { CategoryCards } from '@/components/category-cards';
import { HomeHeader } from '@/components/home-header';
import { ProfileModal } from '@/components/profile-modal';
import { RecentlyAdded } from '@/components/recently-added';
import { TutorialOverlay } from '@/components/tutorial-overlay';
import { useTutorial } from '@/hooks/use-tutorial';
import { router } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI, passwordAPI } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';

const NAV_BAR_TOTAL_HEIGHT = 80;
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomPadding = NAV_BAR_TOTAL_HEIGHT + insets.bottom;
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState({ total: 0, strong: 0, weak: 0 });
  const {
    showTutorial,
    isLoading: tutorialLoading,
    currentStep,
    nextStep,
    previousStep,
    completeTutorial,
    skipTutorial,
  } = useTutorial();

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await authAPI.getMe();
      setUsername(user.username);
      setEmail(user.email);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const passwords = await passwordAPI.list();
      const total = passwords.length;
      // You can add strength validation logic here
      setStats({ total, strong: Math.floor(total * 0.7), weak: Math.ceil(total * 0.3) });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
      fetchUserData();
      fetchStats();
    }, [])
  );

  const handleLogout = () => {
    router.replace('/welcome' as any);
  };

  return (
    <View style={styles.container}>
      <HomeHeader 
        onProfilePress={() => setProfileModalVisible(true)} 
        username={username}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your Digital Vault</Text>
          <Text style={styles.heroSubtitle}>Secure • Simple • Smart</Text>
          
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.strong}</Text>
              <Text style={styles.statLabel}>Strong</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.weak}</Text>
              <Text style={styles.statLabel}>Weak</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(password-management)/add-password')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="add-circle" size={28} color="#2196F3" />
              </View>
              <Text style={styles.actionTitle}>Add New{"\n"}Password</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/generator')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="key" size={28} color="#9C27B0" />
              </View>
              <Text style={styles.actionTitle}>Generate{"\n"}Password</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(password-management)/weak-passwords-list')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="warning" size={28} color="#FF9800" />
              </View>
              <Text style={styles.actionTitle}>Check{"\n"}Weak</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(sharing)/shared-passwords-list')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="share-social" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.actionTitle}>View{"\n"}Shared</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <CategoryCards key={`categories-${refreshKey}`} />
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <RecentlyAdded key={`recent-${refreshKey}`} />
        </View>
      </ScrollView>

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onLogout={handleLogout}
        username={username}
        email={email}
      />

      {!tutorialLoading && (
        <TutorialOverlay
          visible={showTutorial}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          currentStep={currentStep}
          onNext={nextStep}
          onPrevious={previousStep}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#6B72FF',
    shadowColor: '#6B72FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
});
