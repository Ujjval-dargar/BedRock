import { useEffect } from 'react';
import { Dimensions, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
    // The nav bar height including its bottom padding
    // The container is positioned at bottom: 0, and React Native handles system bars automatically
    const navBarHeight = 60;
    const navBarPaddingBottom = 8;
    const navBarTotalHeight = navBarHeight + navBarPaddingBottom + insets.bottom + 20; // nav height + padding + safe area + margin
    
    switch (step.position) {
      case 'center':
        return {
          top: SCREEN_HEIGHT / 2 - 60,
          left: SCREEN_WIDTH / 2 - 150,
          width: 300,
        };
      case 'bottom':
        return {
          bottom: navBarTotalHeight,
          left: SCREEN_WIDTH / 2 - 150,
          width: 300,
        };
      case 'left':
        return {
          bottom: navBarTotalHeight,
          left: 20,
          width: 280,
        };
      case 'l_center':
        return {
          bottom: navBarTotalHeight + 30,
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

    const navBarHeight = 60; // NAV_BAR_HEIGHT from custom-bottom-nav
    const fabSize = 56; // FAB_SIZE from custom-bottom-nav
    const navBarPaddingHorizontal = 4;
    const circleSize = 90;
    
    // Calculate vertical position consistently from bottom
    // iOS: nav bar extends into safe area, insets.bottom is significant (e.g., 34px)
    // Android: insets.bottom is 0, nav bar is positioned above system buttons by React Native
    // The key: only use insets.bottom if it's actually present (iOS devices with home indicator)
    const navBarPaddingBottom = 8;
    const iconAndLabelCenter = 25; // Visual center from top of nav bar
    
    // Use insets.bottom only when it exists (iOS with home indicator), otherwise 0 (Android/older iOS)
    const actualSafeArea = Platform.OS === 'ios' ? insets.bottom : 0;
    const itemCenterFromBottom = actualSafeArea + navBarPaddingBottom + (navBarHeight - navBarPaddingBottom - iconAndLabelCenter);

    // Navigation bar now uses space-evenly for equal spacing
    // Left section: justifyContent: 'space-evenly', paddingRight: fabSize/2 (28)
    // Right section: justifyContent: 'space-evenly', paddingLeft: fabSize/2 (28)
    // Each nav item: minWidth: 60, paddingHorizontal: 8
    
    // Calculate section boundaries
    const fabCenter = SCREEN_WIDTH / 2;
    const leftSectionStart = navBarPaddingHorizontal;
    const leftSectionEnd = fabCenter - (fabSize / 2);
    const rightSectionStart = fabCenter + (fabSize / 2);
    const rightSectionEnd = SCREEN_WIDTH - navBarPaddingHorizontal;
    
    // Available width for items (minus FAB padding)
    const leftSectionWidth = leftSectionEnd - leftSectionStart - (fabSize / 2);
    const rightSectionWidth = rightSectionEnd - rightSectionStart - (fabSize / 2);
    
    // With space-evenly: distribute items evenly across the width
    // For 2 items, they're positioned at 1/3 and 2/3 of the section
    const leftItemPosition = leftSectionWidth / 3;
    const rightItemPosition = rightSectionWidth / 3;

    let highlightStyle: any = {};

    switch (step.target) {
      case 'vault':
        // Second item in left section (at 2/3 position with space-evenly)
        const vaultX = leftSectionStart + (leftItemPosition * 2);
        highlightStyle = {
          bottom: itemCenterFromBottom - (circleSize / 2),
          left: vaultX - (circleSize / 2) + 28,
          width: circleSize,
          height: circleSize,
        };
        break;
      case 'fab':
        // FAB is absolutely positioned at center, raised above nav bar
        // FAB positioning: top: -fabSize/2 + 8 = -28 + 8 = -20 from top of nav bar
        // This means FAB center is at: navBarHeight - 20 - fabSize/2 = 60 - 20 - 28 = 12 from top of nav bar
        const fabVisualCenter = 12; // From top of nav bar
        const fabCenterFromBottom = actualSafeArea + navBarPaddingBottom + (navBarHeight - navBarPaddingBottom - fabVisualCenter);
        highlightStyle = {
          bottom: fabCenterFromBottom - (circleSize / 2),
          left: fabCenter - (circleSize / 2),
          width: circleSize,
          height: circleSize,
        };
        break;
      case 'generator':
        // First item in right section (at 1/3 position with space-evenly)
        const generatorX = rightSectionStart + (fabSize / 2) + rightItemPosition;
        highlightStyle = {
          bottom: itemCenterFromBottom - (circleSize / 2),
          left: generatorX - (circleSize / 2) - 26,
          width: circleSize,
          height: circleSize,
        };
        break;
      case 'risks':
        // Second item in right section (at 2/3 position with space-evenly)
        const risksX = rightSectionStart + (fabSize / 2) + (rightItemPosition * 2);
        highlightStyle = {
          bottom: itemCenterFromBottom - (circleSize / 2),
          left: risksX - (circleSize / 2) + 6,
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
