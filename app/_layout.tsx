import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Authentication Screens */}
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="master-password" />
        <Stack.Screen name="login-master-password" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="forgot-password-reset" />
        <Stack.Screen name="authentication-key" />
        
        {/* Main App Screens */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="create-password" />
        <Stack.Screen name="edit-password" />
        <Stack.Screen name="view-password" />
        <Stack.Screen name="duplicate-passwords" />
        <Stack.Screen name="leaked-passwords" />
        <Stack.Screen name="safe-passwords" />
        <Stack.Screen name="weak-passwords" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
