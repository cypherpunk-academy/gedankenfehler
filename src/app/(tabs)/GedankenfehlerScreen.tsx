import React, { useContext, useMemo, useRef } from 'react';
import {
    StyleSheet,
    View,
    Animated,
    Dimensions,
    ScrollView,
    ActivityIndicator,
    useColorScheme,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DatabaseContext } from '@/providers';
import { Weltanschauungen } from '@/constants/Weltanschauungen';
import { ScrollAuswahl } from '@/components/ScrollAuswahl';
import { TabsColors } from '@/constants/TabsColors';
import { AuswahlRad } from '@/components/Auswahlrad/index';
import {
    DeviceType,
    ScreenProfiles,
    useDeviceProfile,
} from '@/utils/DeviceProfiles';

// Layout constants
const windowWidth = Dimensions.get('window').width;

// AuswahlRad config - now handled by device profiles

const dynamicFontSizes = {
    small: 15,
    medium: 17,
    large: 18,
    xlarge: 20,
};

export default function GedankenfehlerScreen() {
    const router = useRouter();

    // Get device profile
    const deviceProfile = useDeviceProfile(getScreenProfiles());
    const auswahlRadOptions = deviceProfile.auswahlRad;
    const scrollAuswahlOptions = deviceProfile.scrollAuswahl;

    const styles = getStyles(deviceProfile);

    const {
        gedanken: allGedanken,
        autoren: allAutoren,
        isLoadingGedanken,
        errorGedanken,
        errorAutoren,
        isLoadingAutoren,
        weltanschauungIndex,
        setWeltanschauungIndex,
        nummer,
        setNummer,
    } = useContext(DatabaseContext);

    const currentWeltanschauung = Weltanschauungen[weltanschauungIndex];

    const currentAutor = useMemo(() => {
        if (!allGedanken || !allAutoren) return null;

        const matchingGedanke = allGedanken.find(
            (g) => g.weltanschauung === currentWeltanschauung
        );

        if (matchingGedanke && matchingGedanke.autorId) {
            return allAutoren.find(
                (autor) => autor.id === matchingGedanke.autorId
            );
        }

        return null;
    }, [allGedanken, allAutoren, currentWeltanschauung]);

    // Extract all unique thoughts (Ausgangsgedanken) with their numbers
    const alleAusgangsgedanken = useMemo(() => {
        if (!allGedanken) return [];

        const gedankenMap = new Map();

        allGedanken.forEach((gedanke) => {
            if (gedanke.nummer !== undefined && gedanke.ausgangsgedanke) {
                gedankenMap.set(gedanke.nummer, {
                    nummer: gedanke.nummer,
                    ausgangsgedanke: gedanke.ausgangsgedanke,
                });
            }
        });

        return Array.from(gedankenMap.values()).sort(
            (a, b) => a.nummer - b.nummer
        );
    }, [allGedanken]);

    const filteredAusgangsgedanken = useMemo(() => {
        if (!allGedanken) return [];

        return alleAusgangsgedanken.filter((item) => {
            return allGedanken.some(
                (g) =>
                    g.nummer === item.nummer &&
                    g.weltanschauung === currentWeltanschauung
            );
        });
    }, [alleAusgangsgedanken, allGedanken, currentWeltanschauung]);

    const scrollPickerY = useRef(new Animated.Value(0)).current;

    const currentGedankeKurz = useMemo(() => {
        if (!allGedanken) return null;

        const gedanke = allGedanken.find(
            (g) =>
                g.nummer === nummer &&
                g.weltanschauung === currentWeltanschauung
        );
        return gedanke ? gedanke.gedanke_kurz : null;
    }, [allGedanken, nummer, currentWeltanschauung]);

    // Dynamic font sizing based on text length
    const dynamicFontSize = useMemo(() => {
        if (!currentGedankeKurz) return dynamicFontSizes.large;
        const wordCount = currentGedankeKurz.trim().split(/\s+/).length;

        if (wordCount > 50) return dynamicFontSizes.small;
        if (wordCount > 40) return dynamicFontSizes.medium;
        if (wordCount > 25) return dynamicFontSizes.large;
        return dynamicFontSizes.xlarge;
    }, [currentGedankeKurz]);

    // Fade title on scroll
    const opacityInterpolation = scrollPickerY.interpolate({
        inputRange: [-1, 60],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const titleOpacity = useMemo(() => {
        return opacityInterpolation;
    }, [opacityInterpolation]);

    // Handle navigation to the next screen
    const handleNavigateToNextScreen = () => {
        router.push('/(tabs)/AufloesungScreen');
    };

    if (isLoadingGedanken || isLoadingAutoren) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <ThemedText style={styles.loadingText}>
                    Lade Daten...
                    {errorGedanken && `\nerrorGedanken: ${errorGedanken}`}
                    {errorAutoren && `\nerrorAutoren: ${errorAutoren}`}
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Left side - Gedankenfehlerauswahl (30%) */}
            <ThemedView style={styles.gedankenfehlerContainer}>
                <ThemedText style={styles.titleTextGedankenfehler}>
                    {`${alleAusgangsgedanken.length} kulturgewordene Gedankenfehler`}
                </ThemedText>
                <ScrollAuswahl
                    items={filteredAusgangsgedanken}
                    selectedValue={nummer}
                    onValueChange={(itemValue: number) => setNummer(itemValue)}
                    onScrollPositionChange={(position) => {
                        scrollPickerY.setValue(position);
                    }}
                    options={scrollAuswahlOptions}
                />
            </ThemedView>

            {/* Right side - Main thought display and wheel (70%) */}
            <ThemedView style={styles.weltanschuungenContainer}>
                <ThemedText style={{ ...styles.titleTextWeltanschauungen }}>
                    12 Weltanschauungen
                </ThemedText>
                {currentWeltanschauung && currentAutor && (
                    <TouchableOpacity
                        style={[styles.canvasViewContainer]}
                        onPress={handleNavigateToNextScreen}
                        activeOpacity={0.8}
                    >
                        <ThemedView
                            style={styles.canvasWeltanschauungContainer}
                        >
                            <ThemedText
                                style={styles.canvasWeltanschauungTitle}
                            >
                                {currentWeltanschauung}
                            </ThemedText>
                            <ThemedText style={styles.canvasGedankeKurzLabel}>
                                {currentAutor.name}
                            </ThemedText>
                            <ThemedText
                                style={styles.canvasGedankeKurzContainer}
                            >
                                <ThemedText
                                    style={[
                                        styles.canvasGedankeKurz,
                                        {
                                            fontSize: dynamicFontSize,
                                            lineHeight: dynamicFontSize * 1.4,
                                        },
                                    ]}
                                >
                                    {currentGedankeKurz?.trim()}
                                </ThemedText>
                            </ThemedText>
                        </ThemedView>
                    </TouchableOpacity>
                )}
            </ThemedView>
            {/* Worldview selection wheel */}
            <ThemedView
                style={[
                    styles.auswahlradContainer,
                    {
                        left: auswahlRadOptions.circleOffsetX,
                        top: auswahlRadOptions.circleOffsetY,
                    },
                ]}
            >
                <AuswahlRad
                    allAutoren={allAutoren}
                    weltanschauungIndex={weltanschauungIndex}
                    setWeltanschauungIndex={setWeltanschauungIndex}
                    options={auswahlRadOptions}
                />
            </ThemedView>
        </ThemedView>
    );
}

const getScreenProfiles = (): Record<DeviceType, ScreenProfiles> => {
    return {
        smartphone: {
            container: {
                flexDirection: 'column',
                marginTop: 20,
                titleHeight: 50,
            },
            titleTextGedankenfehler: {
                fontSize: 22,
            },
            scrollAuswahl: {
                itemHeight: 60,
                visibleItems: 3,
                fontSize: 20,
            },
            auswahlRad: {
                circleSize: 820,
                circleOffsetX: -210,
                circleOffsetY: 410,
                minTapDistanceFromCenter: 20,
                autorImageSize: 170,
                autorImageSizeLarge: 220,
                autorImageRadius: 22,
                autorImageRadiusLarge: 8,
            },
            canvasViewContainer: {
                width: 380,
                height: 250,
                marginTop: 190,
                marginLeft: -30,
            },
        },
        tablet: {
            container: { flexDirection: 'column' },
            titleTextGedankenfehler: {
                fontSize: 24,
            },
            auswahlRad: {
                circleSize: 722,
                circleOffsetX: -170,
                circleOffsetY: 400,
                minTapDistanceFromCenter: 20,
                autorImageSize: 130,
                autorImageSizeLarge: 200,
                autorImageRadius: 20,
                autorImageRadiusLarge: 10,
            },
            scrollAuswahl: {
                itemHeight: 50,
                visibleItems: 5,
                fontSize: 18,
            },
        },
        webSmall: {
            container: { flexDirection: 'column' },
            titleTextGedankenfehler: {
                fontSize: 24,
            },
            auswahlRad: {
                circleSize: 850,
                circleOffsetX: -170,
                circleOffsetY: 450,
                minTapDistanceFromCenter: 20,
                autorImageSize: 150,
                autorImageSizeLarge: 230,
                autorImageRadius: 25,
                autorImageRadiusLarge: 12,
            },
            scrollAuswahl: {
                itemHeight: 60,
                visibleItems: 5,
                fontSize: 20,
            },
        },
        webMedium: {
            container: { flexDirection: 'row' },
            titleTextGedankenfehler: {
                fontSize: 24,
            },
            auswahlRad: {
                circleSize: 850,
                circleOffsetX: -170,
                circleOffsetY: 450,
                minTapDistanceFromCenter: 20,
                autorImageSize: 150,
                autorImageSizeLarge: 230,
                autorImageRadius: 25,
                autorImageRadiusLarge: 12,
            },
            scrollAuswahl: {
                itemHeight: 60,
                visibleItems: 5,
                fontSize: 20,
            },
        },
        webLarge: {
            container: { flexDirection: 'row', marginTop: 0, titleHeight: 60 },
            titleTextGedankenfehler: {
                fontSize: 32,
            },
            scrollAuswahl: {
                itemHeight: 80,
                visibleItems: 10,
                fontSize: 30,
            },
            auswahlRad: {
                circleSize: 1000,
                circleOffsetX: 890,
                circleOffsetY: 190,
                minTapDistanceFromCenter: 20,
                autorImageSize: 180,
                autorImageSizeLarge: 250,
                autorImageRadius: 25,
                autorImageRadiusLarge: 12,
            },
            canvasViewContainer: {
                width: 620,
                height: 550,
                marginTop: 310,
                marginLeft: -30,
            },
        },
    };
};

// Theme-aware styles
const getStyles = (deviceProfile: ScreenProfiles) => {
    const colorScheme = useColorScheme();
    const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
    const flexDirection = deviceProfile.container?.flexDirection || 'column';
    const titleTextFontSize =
        deviceProfile.titleTextGedankenfehler?.fontSize || 24;
    const titleTextLineHeight = titleTextFontSize * 1.3;

    return StyleSheet.create({
        // Layout container
        container: {
            flex: 1,
            flexDirection,
            marginTop: deviceProfile.container?.marginTop || 0,
            padding: 16,
        },
        gedankenfehlerContainer: {
            width: flexDirection === 'row' ? '40%' : '100%',
            paddingRight: 8,
            position: 'relative',
            alignItems: 'center',
        },
        weltanschuungenContainer: {
            position: 'relative',
            width: flexDirection === 'row' ? '60%' : windowWidth,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // Title and text elements
        titleTextGedankenfehler: {
            position: 'relative',
            width: '100%',
            height: deviceProfile.container?.titleHeight || 32,
            padding: 5,
            marginBottom: 10,
            fontFamily: 'OverlockBold',
            fontSize: titleTextFontSize,
            lineHeight: titleTextLineHeight,
            textAlign: 'center',
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            color: TabsColors[theme].gedankenfehlerDefaultColor,
            borderColor: TabsColors[theme].gedankenfehlerDefaultColor,
            backgroundColor:
                TabsColors[theme].titleTextGedankenfehlerBackgroundColor,
        },
        titleTextWeltanschauungen: {
            position: 'relative',
            width: '100%',
            padding: 5,
            fontFamily: 'OverlockBold',
            fontSize: 32,
            lineHeight: 48,
            marginTop: deviceProfile.container?.marginTop || 0,
            textAlign: 'center',
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            color: TabsColors[theme].weltanschauungenDefaultColor,
            borderColor: TabsColors[theme].weltanschauungenDefaultColor,
            backgroundColor:
                TabsColors[theme].titleTextWeltanschauungenBackgroundColor,
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            fontWeight: 'bold',
        },

        // Center container and elements
        canvasViewContainer: {
            width: deviceProfile.canvasViewContainer?.width || 370,
            height: deviceProfile.canvasViewContainer?.height || 250,
            marginTop: deviceProfile.canvasViewContainer?.marginTop || 190,
            marginLeft: deviceProfile.canvasViewContainer?.marginLeft || -30,
            zIndex: 10,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
        },
        canvasWeltanschauungContainer: {
            // Size and positioning
            position: 'absolute',
            width: '100%',
            height: '113%',
            top: -10,
            padding: 0,
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden',

            // Appearance
            backgroundColor:
                TabsColors[theme].canvasWeltanschauungContainerBackgroundColor,
            borderRadius: 60,

            // Borders
            borderWidth: 3.5,
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderColor:
                TabsColors[theme].canvasWeltanschauungContainerBorderColor,
            borderTopColor:
                TabsColors[theme].canvasWeltanschauungContainerBorderTopColor,
            borderBottomColor:
                TabsColors[theme]
                    .canvasWeltanschauungContainerBorderBottomColor,

            // Shadow
            shadowColor: TabsColors[theme].weltanschauungenDefaultColor,
            shadowOffset: { width: 6, height: 10 },
            shadowOpacity: 1,
            shadowRadius: 5,
            elevation: 8,
        },
        canvasWeltanschauungTitle: {
            marginTop: 15,
            fontFamily: 'OverlockBold',
            fontSize: 28,
            lineHeight: 28,
            color: TabsColors[theme].weltanschauungenDefaultColor,
            textAlign: 'center',
        },
        canvasGedankeKurzLabel: {
            fontFamily: 'OverlockRegular',
            fontSize: 14,
            color: TabsColors[theme].weltanschauungenDefaultColor,
            textAlign: 'center',
            backgroundColor: 'transparent',
        },
        canvasGedankeKurzContainer: {
            padding: 5,
            paddingHorizontal: 10,
        },
        canvasGedankeKurz: {
            fontFamily: 'OverlockBold',
            color: TabsColors[theme].weltanschauungenDefaultColor,
            textAlign: 'center',
            backgroundColor: 'transparent',
        },

        // Auswahl wheel
        auswahlradContainer: {
            position: 'absolute',
            backgroundColor: 'transparent',
        },
    });
};
