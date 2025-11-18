import { CategoryCards } from '@/components/category-cards';
import { HomeHeader } from '@/components/home-header';
import { ProfileModal } from '@/components/profile-modal';
import { RecentlyAdded } from '@/components/recently-added';
import { SearchBar } from '@/components/search-bar';
import { TutorialOverlay } from '@/components/tutorial-overlay';
import { useTutorial } from '@/hooks/use-tutorial';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAV_BAR_TOTAL_HEIGHT = 90; // Navigation bar height + FAB overlap + margin

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomPadding = NAV_BAR_TOTAL_HEIGHT + insets.bottom + 20;
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    showTutorial,
    isLoading: tutorialLoading,
    currentStep,
    nextStep,
    previousStep,
    completeTutorial,
    skipTutorial,
  } = useTutorial();

  // Refresh components when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const handleLogout = () => {
    // Clear any stored auth data here (AsyncStorage, SecureStore, etc.)
    // For now, navigate back to welcome screen
    router.replace('/welcome' as any);
  };

  return (
    <View style={styles.container}>
      <HomeHeader onProfilePress={() => setProfileModalVisible(true)} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>Manage your</Text>
          <Text style={styles.title}>Password Easily</Text>
        </View>
        
        <SearchBar />
        <CategoryCards key={`categories-${refreshKey}`} />
        <RecentlyAdded key={`recent-${refreshKey}`} />
      </ScrollView>

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onLogout={handleLogout}
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6F6BF5',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6F6BF5',
  },
});
