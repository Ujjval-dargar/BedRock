// Temporary module declarations to unblock TypeScript until proper types are installed
declare module "expo-clipboard" {
  export function getStringAsync(): Promise<string>;
  export function setStringAsync(content: string): Promise<void>;
  const _default: any;
  export default _default;
}

declare module "@react-native-picker/picker" {
  import * as React from "react";
  export const Picker: any;
  export default Picker;
}

