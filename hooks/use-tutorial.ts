import { useEffect, useState } from 'react';
import { authAPI, STORAGE_KEYS } from '../utils/api';

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
      
      // Check is_first_login flag from AsyncStorage (set during login)
      const isFirstLogin = await AsyncStorage.getItem(STORAGE_KEYS.IS_FIRST_LOGIN);
      
      if (isFirstLogin === 'false') {
        setShowTutorial(false);
        tutorialCompleted = true;
      } else {
        setShowTutorial(true);
        tutorialCompleted = false;
      }
    } catch (error) {
      // Silently handle error
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
      // Call API to mark tutorial as completed in database
      await authAPI.completeTutorial();
      tutorialCompleted = true;
      setShowTutorial(false);
    } catch (error) {
      // Even if API fails, mark as completed locally
      tutorialCompleted = true;
      setShowTutorial(false);
    }
  };

  const skipTutorial = async () => {
    try {
      // Call API to mark tutorial as completed in database
      await authAPI.completeTutorial();
      tutorialCompleted = true;
      setShowTutorial(false);
    } catch (error) {
      // Even if API fails, mark as completed locally
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
      // Reset local storage flag (Note: This won't update database)
      await AsyncStorage.setItem(STORAGE_KEYS.IS_FIRST_LOGIN, 'true');
      tutorialCompleted = false;
      setShowTutorial(true);
      setCurrentStep(1);
    } catch (error) {
      // Silently handle error
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
