import { useEffect } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TutorialStep {
  id: number;
  text: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'l_center';
  target?: 'vault' | 'fab' | 'generator' | 'risks';
  pointerDirection?: 'up' | 'down' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    text: 'Welcome to BedRock! This tutorial will inform you of the core features we offer.',
    position: 'center',
  },
  {
    id: 2,
    text: 'The vault section is where all your passwords are stored',
    position: 'bottom',
    target: 'vault',
  },
  {
    id: 3,
    text: 'Press the "+" button to add a new password to the vault',
    position: 'l_center',
    target: 'fab',
  },
  {
    id: 4,
    text: 'Generate strong passwords with customisable rules',
    position: 'left',
    target: 'generator',
  },
  {
    id: 5,
    text: 'The risks tab tells you the status of your saved passwords (strong/weak/leaked)',
    position: 'left',
    target: 'risks',
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
  const highlightOpacity = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      cancelAnimation(highlightOpacity);
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      if (tutorialSteps[currentStep - 1]?.target) {
        highlightOpacity.value = withTiming(1, { duration: 300 });
      } else {
        highlightOpacity.value = withTiming(0, { duration: 200 });
      }
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
      highlightOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, currentStep]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const boxStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlightOpacity.value,
  }));

  if (!visible || currentStep < 1 || currentStep > tutorialSteps.length) {
    return null;
  }

  const step = tutorialSteps[currentStep - 1];
  const isFirst = currentStep === 1;
  const isLast = currentStep === tutorialSteps.length;

  const getBoxPosition = () => {
    switch (step.position) {
      case 'center':
        return {
          top: SCREEN_HEIGHT / 2 - 60,
          left: SCREEN_WIDTH / 2 - 150,
          width: 300,
        };
      case 'bottom':
        return {
          bottom: 100,
          left: SCREEN_WIDTH / 2 - 150,
          width: 300,
        };
      case 'left':
        return {
          bottom: 100,
          left: 20,
          width: 280,
        };
      case 'l_center':
        return {
          bottom: 130,
          left: 20,
          width: 280,
        };
      default:
        return {
          top: SCREEN_HEIGHT / 2 - 60,
          left: SCREEN_WIDTH / 2 - 150,
          width: 300,
        };
    }
  };

  const getHighlightStyle = () => {
    if (!step.target) return null;

    const navBarBottom = insets.bottom + 8;
    const navBarCenterX = SCREEN_WIDTH / 2;
    const navBarMargin = 16;
    const navBarPadding = 4;
    const fabSize = 56;
    const navBarHeight = 70;

    const leftSectionStart = navBarMargin + navBarPadding;
    const leftSectionEnd = navBarCenterX - 28;
    const leftSectionWidth = leftSectionEnd - leftSectionStart;

    const rightSectionStart = navBarCenterX + 28;
    const rightSectionEnd = SCREEN_WIDTH - navBarMargin - navBarPadding;
    const rightSectionWidth = rightSectionEnd - rightSectionStart;

    let highlightStyle: any = {};
    const circleSize = 80;

    switch (step.target) {
      case 'vault':
        const vaultX = leftSectionStart + leftSectionWidth * 0.75;
        highlightStyle = {
          bottom: navBarBottom + navBarHeight / 2 - circleSize / 2,
          left: vaultX - circleSize / 2,
          width: circleSize,
          height: circleSize,
        };
        break;
      case 'fab':
        highlightStyle = {
          bottom: navBarBottom + navBarHeight / 2 - 14,
          left: navBarCenterX - circleSize / 2 - 4,
          width: circleSize,
          height: circleSize,
        };
        break;
      case 'generator':
        const generatorX = rightSectionStart + rightSectionWidth * 0.25;
        highlightStyle = {
          bottom: navBarBottom + navBarHeight / 2 - circleSize / 2,
          left: generatorX - circleSize / 2,
          width: circleSize,
          height: circleSize,
        };
        break;
      case 'risks':
        const risksX = rightSectionStart + rightSectionWidth * 0.75;
        highlightStyle = {
          bottom: navBarBottom + navBarHeight / 2 - circleSize / 2,
          left: risksX - circleSize / 2,
          width: circleSize,
          height: circleSize,
        };
        break;
    }

    return highlightStyle;
  };

  const boxPosition = getBoxPosition();
  const highlightPosition = getHighlightStyle();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onSkip} statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <View style={[styles.backdrop, { top: -insets.top, bottom: -insets.bottom, left: -insets.left, right: -insets.right }]} />

        <Animated.View style={[styles.overlayBox, boxPosition, boxStyle]}>
          <Text style={styles.overlayText}>{step.text}</Text>

          <View style={styles.buttonContainer}>
            {!isFirst && (
              <Pressable style={styles.navButton} onPress={onPrevious}>
                <Text style={styles.navButtonText} numberOfLines={1}>Previous</Text>
              </Pressable>
            )}
            <Pressable style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
            {isLast ? (
              <Pressable style={styles.nextButton} onPress={onComplete}>
                <Text style={styles.nextButtonText} numberOfLines={1}>Got it</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.nextButton} onPress={onNext}>
                <Text style={styles.nextButtonText} numberOfLines={1}>Next</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {highlightPosition && <Animated.View style={[styles.highlightCircle, highlightPosition, highlightStyle]} />}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  backdrop: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  highlightCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    shadowOpacity: 1,
    elevation: 25,
  },
  overlayBox: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  overlayText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#6F6BF5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
