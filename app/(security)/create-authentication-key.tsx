import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthenticationKeyScreen() {
  const [authKey, setAuthKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate a random authentication key on mount
  useEffect(() => {
    // TODO: Replace with actual key generation from backend
    const generatedKey = generateAuthKey();
    setAuthKey(generatedKey);
  }, []);

  const generateAuthKey = () => {
    // Simple key generation - replace with proper secure key generation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 20; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i < 19) {
        key += '-';
      }
    }
    return key;
  };

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(authKey);
        Alert.alert('Success', 'Authentication key copied to clipboard');
      } else {
        // For native, we'll show the key for manual copy or install expo-clipboard
        // For now, just show an alert with instructions
        Alert.alert(
          'Copy Key',
          `Please copy this key manually: ${authKey}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to copy key');
    }
  };

  const handleProceed = async () => {
    if (!authKey.trim()) {
      alert('Authentication key is required');
      return;
    }

    setIsLoading(true);
    // TODO: Implement actual authentication key storage logic here
    // For now, navigate to main app home screen
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)/home' as any);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Authentication Code</Text>

            {/* Description */}
            <Text style={styles.description}>
              Please keep this safe.
              
            </Text>
            {/* Description */}
            <Text style={styles.description}>
              If you lose your master password, you will need to input this code to regain access. There is no other way.
            </Text>
            {/* Input Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Authentication key"
                  placeholderTextColor="#626262"
                  value={authKey}
                  onChangeText={setAuthKey}
                  editable={false}
                  multiline
                  numberOfLines={3}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.copyIcon}
                  onPress={handleCopy}
                >
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color="#6B72FF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
              style={[styles.proceedButton, isLoading && styles.proceedButtonDisabled]}
              onPress={handleProceed}
              disabled={isLoading}
            >
              <Text style={styles.proceedButtonText}>
                {isLoading ? 'Processing...' : 'Proceed'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#6B72FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  inputContainer: {
    marginTop: 40,
    marginBottom: 40,
    marginHorizontal: 16,
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B72FF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 48,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
    
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#11181C',
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  copyIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  proceedButton: {
    backgroundColor: '#6B72FF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CDCED0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: 16,
    marginBottom: 36,
    height: 58,
    minHeight: 56,
  },
  proceedButtonDisabled: {
    opacity: 0.6,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});

