/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from 'react-native-paper';
import { Colors } from '../constants/Colors';

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
    const theme = useTheme();
    const currentTheme = theme.dark ? 'dark' : 'light';
    const colorFromProps = props[currentTheme];

    if (colorFromProps) {
        return colorFromProps;
    } else {
        return Colors[currentTheme][colorName];
    }
}
