import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import CustomBottomNav from '@/components/custom-bottom-nav';

export default function TabLayout() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar
        }}>
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="vault" options={{ title: 'Vault' }} />
        <Tabs.Screen name="generator" options={{ title: 'Generator' }} />
        {/* Use the analytics screen for the Risks tab to match original BedRock */}
        <Tabs.Screen name="analytics" options={{ title: 'Risks' }} />
      </Tabs>
      <CustomBottomNav onFABPress={() => router.push('/(password-management)/add-password')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
