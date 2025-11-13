/// <reference types="react" />

declare module 'react-native' {
  import { ComponentType } from 'react';
  
  export const View: ComponentType<any>;
  export const Text: ComponentType<any>;
  export const ScrollView: ComponentType<any>;
  export const Image: ComponentType<any>;
  export const TouchableOpacity: ComponentType<any>;
  export const TextInput: ComponentType<any>;
  export const SafeAreaView: ComponentType<any>;
  export const StyleSheet: any;
  export const Platform: any;
  export const Alert: any;
  export const Switch: ComponentType<any>;
  export const Pressable: ComponentType<any>;
  export const Modal: ComponentType<any>;
  export const KeyboardAvoidingView: ComponentType<any>;
  export const StatusBar: ComponentType<any>;
}

