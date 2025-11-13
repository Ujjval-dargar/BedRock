import { useEffect, useState } from 'react';

const TUTORIAL_COMPLETED_KEY = '@bedrock_tutorial_completed';

let tutorialCompleted = false;

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const completed = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
      if (completed === 'true') {
        setShowTutorial(false);
        tutorialCompleted = true;
      } else {
        setShowTutorial(true);
        tutorialCompleted = false;
      }
    } catch (error) {
      if (tutorialCompleted) {
        setShowTutorial(false);
      } else {
        setShowTutorial(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completeTutorial = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      tutorialCompleted = true;
      setShowTutorial(false);
    } catch (error) {
      tutorialCompleted = true;
      setShowTutorial(false);
    }
  };

  const skipTutorial = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      tutorialCompleted = true;
      setShowTutorial(false);
    } catch (error) {
      tutorialCompleted = true;
      setShowTutorial(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetTutorial = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(TUTORIAL_COMPLETED_KEY);
      tutorialCompleted = false;
      setShowTutorial(true);
      setCurrentStep(1);
    } catch (error) {
      tutorialCompleted = false;
      setShowTutorial(true);
      setCurrentStep(1);
    }
  };

  return {
    showTutorial,
    isLoading,
    currentStep,
    nextStep,
    previousStep,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
}
