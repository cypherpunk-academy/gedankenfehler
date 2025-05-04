import { useTheme } from 'react-native-paper';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
    const theme = useTheme();
    return theme.dark ? 'dark' : 'light';
}
