/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
    light: {
        text: '#11181C',
        background: '#fefefe',
        tint: tintColorLight,
        icon: '#687076',
        tabIconDefault: '#687076',
        tabIconSelected: tintColorLight,

        cardBackground: '#fff',
        nummerCircleText: '#130440',
        nummerCircleBackground: '#39219730',
        ausgangsgedanke: '#c51458',
        ausgangsgedankeInWA: '#a51537',
        gedanke: '#23047f',
    },
    dark: {
        text: '#ECEDEE',
        background: '#151718',
        tint: tintColorDark,
        icon: '#9BA1A6',
        tabIconDefault: '#9BA1A6',
        tabIconSelected: tintColorDark,

        cardBackground: '#151718',
        nummerCircleText: '#fff',
        nummerCircleBackground: '#1d0b64',
        ausgangsgedanke: '#fff',
        ausgangsgedankeInWA: '#fff',
        gedanke: '#fff',
    },
};
