import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface TutorialStep {
  id: number;
  title: string;
  text: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Welcome to BedRock!',
    text: 'Your secure password manager with zero-knowledge encryption. Your master password never leaves your device.',
    icon: 'shield',
    iconColor: '#6F6BF5',
  },
  {
    id: 2,
    title: 'Vault',
    text: 'Store all your passwords securely in one place. Access them anytime with your master password.',
    icon: 'lock-outline',
    iconColor: '#6F6BF5',
  },
  {
    id: 3,
    title: 'Add Passwords',
    text: 'Tap the "+" button to quickly add new passwords to your vault. You can also import from other password managers.',
    icon: 'add-circle-outline',
    iconColor: '#6F6BF5',
  },
  {
    id: 4,
    title: 'Password Generator',
    text: 'Generate strong, unique passwords with customizable rules including length, symbols, and numbers.',
    icon: 'vpn-key',
    iconColor: '#6F6BF5',
  },
  {
    id: 5,
    title: 'Security Analysis',
    text: 'Monitor your password health. Get alerts for weak, reused, or compromised passwords to stay secure.',
    icon: 'show-chart',
    iconColor: '#6F6BF5',
  },
];

interface TutorialOverlayProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
}

export function TutorialOverlay({
  visible,
  onComplete,
  onSkip,
  currentStep,
  onNext,
  onPrevious,
}: TutorialOverlayProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
  }, [visible, currentStep, opacity, scale]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible || currentStep < 1 || currentStep > tutorialSteps.length) {
    return null;
  }

  const step = tutorialSteps[currentStep - 1];
  const isFirst = currentStep === 1;
  const isLast = currentStep === tutorialSteps.length;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onSkip} statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <View style={styles.backdrop} />

        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${step.iconColor}15` }]}>
              <MaterialIcons name={step.icon} size={48} color={step.iconColor} />
            </View>
            <Text style={styles.title}>{step.title}</Text>
          </View>

          <Text style={styles.description}>{step.text}</Text>

          <View style={styles.progressContainer}>
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep - 1 && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {!isFirst && (
              <Pressable style={styles.secondaryButton} onPress={onPrevious}>
                <MaterialIcons name="arrow-back" size={20} color="#666" />
                <Text style={styles.secondaryButtonText}>Previous</Text>
              </Pressable>
            )}
            
            {!isLast && (
              <Pressable style={[styles.skipButton, isFirst && styles.skipButtonFirst]} onPress={onSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </Pressable>
            )}

            <Pressable style={[styles.primaryButton, (isLast || isFirst) && styles.primaryButtonExpanded]} onPress={isLast ? onComplete : onNext}>
              <Text style={styles.primaryButtonText}>{isLast ? 'Get Started' : 'Next'}</Text>
              <MaterialIcons name={isLast ? 'check' : 'arrow-forward'} size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#6F6BF5',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#6F6BF5',
    borderRadius: 12,
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonExpanded: {
    flex: 1,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonFirst: {
    flex: 1,
    alignItems: 'flex-start',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
});
