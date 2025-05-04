import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DatabaseProvider, SessionProvider } from '../providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ZainBold: require('../assets/fonts/Zain-Bold.ttf'),
        ZainRegular: require('../assets/fonts/Zain-Regular.ttf'),
        ZainItalic: require('../assets/fonts/Zain-Italic.ttf'),
        OverlockRegular: require('../assets/fonts/Overlock-Regular.ttf'),
        OverlockItalic: require('../assets/fonts/Overlock-Italic.ttf'),
        OverlockBold: require('../assets/fonts/Overlock-Bold.ttf'),
        AkayaKanadaka: require('../assets/fonts/AkayaKanadaka-Regular.ttf'),
    });

    const [queryClient] = useState(() => new QueryClient());

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <DatabaseProvider>
                    <ThemeProvider
                        value={
                            colorScheme === 'dark' ? DarkTheme : DefaultTheme
                        }
                    >
                        <Stack>
                            <Stack.Screen
                                name="(tabs)"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen name="+not-found" />
                        </Stack>
                        <StatusBar style="auto" />
                    </ThemeProvider>
                </DatabaseProvider>
            </SessionProvider>
        </QueryClientProvider>
    );
}
