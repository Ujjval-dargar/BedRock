import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

type BackButtonProps = {
  size?: number;
  color?: string;
  style?: ViewStyle | any;
  onPress?: (e: any) => void;
};

export default function BackButton({ size = 24, color = '#9333EA', style, onPress }: BackButtonProps) {
  const router = useRouter();

  const handle = (e: any) => {
    if (onPress) {
      onPress(e);
      return;
    }
    if (router && typeof router.back === 'function') router.back();
  };

  return (
    <TouchableOpacity onPress={handle} style={[styles.button, style]} activeOpacity={0.85}>
      <IconSymbol name="chevron.right" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
