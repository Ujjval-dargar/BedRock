import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      {/* Link typing can be strict across expo versions; cast to any to avoid type mismatch */}
      {(Link as any)({ href: '/', dismissTo: true, style: styles.link }) as any}
      <LinkPlaceholder />
    </ThemedView>
  );
}

function LinkPlaceholder() {
  // Render the same structure using a runtime cast to avoid TS type mismatch with Link props
  const LinkAny: any = Link;
  return (
    <LinkAny href="/" dismissTo style={styles.link}>
      <ThemedText type="link">Go to home screen</ThemedText>
    </LinkAny>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
