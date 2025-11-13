declare module 'react-native' {
  // Minimal shims to satisfy TypeScript when react-native types are missing or mismatched.
  export const Appearance: any;
  export type ColorSchemeName = 'light' | 'dark' | null;
  export const Dimensions: any;
  export const InteractionManager: any;
  export const findNodeHandle: any;
  export const UIManager: any;
  export type StyleProp<T> = any;
  export type OpaqueColorValue = any;
}

declare module 'react-native-reanimated' {
  // Reanimated types can be strict; provide minimal shims used in the project.
  export const useAnimatedRef: any;
  export const useAnimatedScrollHandler: any;
  export const useSharedValue: any;
  export const withTiming: any;
  export const Animated: any;
  export const useAnimatedStyle: any;
  export const runOnJS: any;
  export const interpolate: any;
  export const useScrollOffset: any;
  export const cancelAnimation: any;
  export const Easing: any;
  export const ScrollView: any;
  export const View: any;
  export const Text: any;
}
