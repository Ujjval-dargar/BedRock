import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import BackButton from '@/components/back-button';
import { BOTTOM_SAFE_AREA } from '@/constants/layout';

// Note: Detecting leaked passwords requires integration with breach detection APIs like HaveIBeenPwned
// For now, this screen shows an empty state
export default function LeakedPasswordsListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (navigation) {
      navigation.setOptions({ headerShown: false });
    }
  }, [navigation]);

  return (
    <ThemedView style={styles.safe}>
      <View style={styles.header}>
        <BackButton />
        <ThemedText style={styles.title}>Leaked Passwords (0)</ThemedText>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_SAFE_AREA + insets.bottom }]}>
        <View style={styles.emptyState}>
          <MaterialIcons name="security" size={64} color="#10B981" />
          <ThemedText style={styles.emptyTitle}>No Leaked Passwords Detected</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            None of your passwords appear in known data breaches. This feature requires integration with breach detection services like HaveIBeenPwned.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F6FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});

