import { Appearance, type ColorSchemeName } from 'react-native';

export function useColorScheme(): ColorSchemeName {
	return Appearance.getColorScheme?.() ?? 'light';
}
