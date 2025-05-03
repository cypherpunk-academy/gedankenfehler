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

// Layout constants
const windowWidth = Dimensions.get('window').width;

const auswahlRadContainerX = -170;
const auswahlRadContainerY = 400;
const dynamicFontSizes = {
    small: 15,
    medium: 17,
    large: 18,
    xlarge: 20,
};

// AuswahlRad config
const auswahlRadOptions = {
    circleSize: 722,
    circleOffsetX: auswahlRadContainerX,
    circleOffsetY: auswahlRadContainerY,
    minTapDistanceFromCenter: 20,
    autorImageSize: 130,
    autorImageSizeLarge: 200,
    autorImageRadius: 20,
    autorImageRadiusLarge: 10,
};

export default function GedankenfehlerScreen() {
    const router = useRouter();
    const styles = getStyles();

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
        if (wordCount > 30) return dynamicFontSizes.large;
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
        <ScrollView style={styles.container}>
            {/* Thought selector */}
            <ThemedView style={styles.pickerContainer}>
                <Animated.Text
                    style={{
                        ...styles.titleTextGedankenfehler,
                        opacity: titleOpacity,
                    }}
                >
                    {`${alleAusgangsgedanken.length} kulturgewordene Gedankenfehler`}
                </Animated.Text>
                <ScrollAuswahl
                    items={filteredAusgangsgedanken}
                    selectedValue={nummer}
                    onValueChange={(itemValue: number) => setNummer(itemValue)}
                    onScrollPositionChange={(position) => {
                        scrollPickerY.setValue(position);
                    }}
                />
            </ThemedView>
            {/* Main thought display */}
            <View style={styles.circleWrapper}>
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
            </View>
            {/* Worldview selection wheel */}
            <ThemedView style={styles.auswahlradContainer}>
                <AuswahlRad
                    allAutoren={allAutoren}
                    weltanschauungIndex={weltanschauungIndex}
                    setWeltanschauungIndex={setWeltanschauungIndex}
                    options={auswahlRadOptions}
                />
            </ThemedView>
        </ScrollView>
    );
}

// Theme-aware styles
const getStyles = () => {
    const colorScheme = useColorScheme();
    const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';

    return StyleSheet.create({
        // Layout containers
        container: {
            flex: 1,
            padding: 16,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        pickerContainer: {
            marginTop: 20,
        },
        circleWrapper: {
            position: 'relative',
            width: windowWidth,
            height: windowWidth,
            marginTop: 70,
            alignItems: 'center',
            justifyContent: 'center',
        },

        // Title and text elements
        titleTextGedankenfehler: {
            position: 'absolute',
            width: '110%',
            top: 0,
            left: -15,
            right: 0,
            padding: 5,
            fontFamily: 'OverlockBold',
            fontSize: 32,
            lineHeight: 36,
            color: TabsColors[theme].gedankenfehlerDefaultColor,
            textAlign: 'center',
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            borderColor: TabsColors[theme].gedankenfehlerDefaultColor,
            backgroundColor:
                TabsColors[theme].titleTextGedankenfehlerBackgroundColor,
        },
        titleTextWeltanschauungen: {
            position: 'absolute',
            width: '105%',
            top: -65,
            right: 0,
            left: -15,
            padding: 5,
            fontFamily: 'OverlockBold',
            fontSize: 32,
            lineHeight: 48,
            color: TabsColors[theme].weltanschauungenDefaultColor,
            textAlign: 'center',
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
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
            width: '93%',
            height: 250,
            marginTop: 230,
            marginLeft: -30,
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
            // fontSize: 18, // s. dynamicFontSize
            // lineHeight: 26, // s. dynamicFontSize
            color: TabsColors[theme].weltanschauungenDefaultColor,
            textAlign: 'center',
            backgroundColor: 'transparent',
        },

        // Auswahl wheel
        auswahlradContainer: {
            position: 'absolute',
            left: auswahlRadContainerX,
            top: auswahlRadContainerY,
        },
    });
};
