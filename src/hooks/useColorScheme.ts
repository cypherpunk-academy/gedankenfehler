import { useTheme } from 'react-native-paper';

export function useColorScheme() {
    const theme = useTheme();
    return theme.dark ? 'dark' : 'light';
}
