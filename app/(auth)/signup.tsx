import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await AsyncStorage.setItem('temp_signup_email', email);
      router.push('/(auth)/create-master-password' as any);
    } 
    catch (error) {
      Alert.alert('Error', 'Failed to proceed with signup');
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.title}>Create Account</Text>

            {/* Description */}
            <Text style={styles.description}>
              Create an account to save your passwords and sync to the account
            </Text>

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#626262"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Sign up Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Sending...' : 'Sign up'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </View>

            {/* Mobile Number Signup Link */}
            {/* <TouchableOpacity 
              style={styles.mobileLink}
              onPress={() => {
                // TODO: Navigate to mobile number signup
                alert('Mobile number signup coming soon');
              }}
            >
              <Text style={styles.mobileLinkText}>Or Sign up with Mobile Number</Text>
            </TouchableOpacity> */}

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
  header: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 32,
    fontWeight: '400',
    textAlign: 'left',
    alignSelf: 'flex-start',
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
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B72FF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#11181C',
    paddingVertical: 0,
  },
  signupButton: {
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
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    
  },
  link: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  mobileLink: {
    alignItems: 'center',
    marginTop: 0,
    
  },
  mobileLinkText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
});

