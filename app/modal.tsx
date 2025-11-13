import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
          <ThemedText type="title">This is a modal</ThemedText>
          {/* Cast Link to any to avoid strict LinkProps mismatch with expo-router types */}
          {(() => {
            const LinkAny: any = Link as any;
            return (
              <LinkAny href="/" dismissTo style={styles.link}>
                <ThemedText type="link">Go to home screen</ThemedText>
              </LinkAny>
            );
          })()}
    </ThemedView>
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
