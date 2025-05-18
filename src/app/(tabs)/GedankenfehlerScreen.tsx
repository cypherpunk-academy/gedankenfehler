import React, { useCallback, useContext, useMemo, useRef } from 'react';
import {
    StyleSheet,
    View,
    Animated,
    Dimensions,
    ActivityIndicator,
    useColorScheme,
    TouchableOpacity,
    Platform,
    ScrollView,
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

// Define the props interface for both components
interface GedankenViewProps {
    styles: any; // Use 'any' to avoid StyleSheet.create return type complexity
    currentWeltanschauung: string;
    currentAutor: { name: string; [key: string]: any };
    currentGedanke: {
        gedanke_kurz?: string;
        gedanke?: string;
        id?: string;
        nummer?: number;
        model?: string;
        autorId?: string;
        weltanschauung?: string;
        created_at?: string;
        ausgangsgedanke?: string;
        ausgangsgedanke_in_weltanschauung?: string;
        gedanke_einfach?: string;
        rank?: number;
        autor?: string | null;
        [key: string]: any;
    };
    deviceType: DeviceType;
    dynamicFontSize?: (fontSize: number) => number;
    handleNavigateToNextScreen?: () => void;
}

// Mobile-specific view component
const MobileGedankenView: React.FC<GedankenViewProps> = ({
    styles,
    currentWeltanschauung,
    currentAutor,
    currentGedanke,
    dynamicFontSize,
    handleNavigateToNextScreen,
}) => {
    // Get the font size safely
    const rawFontSize = styles.canvasGedankeKurz?.fontSize ?? 24;
    const fontSize = dynamicFontSize
        ? dynamicFontSize(rawFontSize)
        : rawFontSize;
    const lineHeight = dynamicFontSize
        ? dynamicFontSize(rawFontSize) * 1.4
        : rawFontSize * 1.4;

    return (
        <TouchableOpacity
            style={styles.canvasViewContainer}
            className="canvasViewContainer"
            onPress={handleNavigateToNextScreen}
            activeOpacity={0.8}
        >
            <ThemedView style={styles.canvasWeltanschauungContainer}>
                <ThemedText style={styles.canvasWeltanschauungTitle}>
                    {currentWeltanschauung}
                </ThemedText>
                <ThemedText style={styles.canvasGedankeKurzLabel}>
                    {currentAutor.name}
                </ThemedText>
                <View style={styles.canvasGedankeKurzContainer}>
                    <ThemedText
                        style={[
                            styles.canvasGedankeKurz,
                            {
                                fontSize,
                                lineHeight,
                            },
                        ]}
                    >
                        {currentGedanke?.gedanke_kurz?.trim()}
                    </ThemedText>
                </View>
            </ThemedView>
        </TouchableOpacity>
    );
};

// Web-specific view component with scrollable text
const WebGedankenView: React.FC<GedankenViewProps> = ({
    styles,
    currentWeltanschauung,
    currentAutor,
    currentGedanke,
}) => {
    return (
        <ScrollView style={styles.canvasViewContainer}>
            <ThemedView style={styles.canvasWeltanschauungContainer}>
                <ThemedText style={styles.canvasWeltanschauungTitle}>
                    {currentWeltanschauung}
                </ThemedText>
                <ThemedText style={styles.canvasGedankeKurzLabel}>
                    {currentAutor.name}
                </ThemedText>
                <View style={styles.canvasGedankeKurzContainer}>
                    <ThemedText style={styles.canvasGedankeKurz}>
                        {currentGedanke?.gedanke_kurz?.trim()}
                    </ThemedText>
                    <ThemedText style={styles.canvasGedanke}>
                        {`${currentGedanke?.gedanke?.trim()}`}
                    </ThemedText>
                </View>
            </ThemedView>
        </ScrollView>
    );
};

export default function GedankenfehlerScreen() {
    const router = useRouter();

    // Get device profile
    const deviceProfile = useDeviceProfile(getScreenProfiles());
    const auswahlRadOptions = deviceProfile.auswahlRad;
    const scrollAuswahlOptions = deviceProfile.scrollAuswahl;
    const deviceType = deviceProfile.deviceType;

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

    const currentGedanke = useMemo(() => {
        if (!allGedanken) return null;

        const gedanke = allGedanken.find(
            (g) =>
                g.nummer === nummer &&
                g.weltanschauung === currentWeltanschauung
        );
        return gedanke;
    }, [allGedanken, nummer, currentWeltanschauung]);

    // Dynamic font sizing based on text length
    const dynamicFontSize = useCallback(
        (fontSize: number) => {
            if (!currentGedanke?.gedanke_kurz || deviceType !== 'smartphone')
                return fontSize;

            const wordCount = currentGedanke.gedanke_kurz
                .trim()
                .split(/\s+/).length;

            if (wordCount > 50) return fontSize * 0.8;
            if (wordCount > 40) return fontSize * 0.9;
            if (wordCount > 25) return fontSize;
            return fontSize * 1.2;
        },
        [currentGedanke]
    );

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

    // Check if this is a web platform
    const isWeb = Platform.OS === 'web';

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.gedankenfehlerContainer}>
                <ThemedText style={styles.titleTextGedankenfehler}>
                    {`${alleAusgangsgedanken.length} Gedankenfehler`}
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
            <ThemedView style={styles.weltanschuungenContainer}>
                <ThemedText style={{ ...styles.titleTextWeltanschauungen }}>
                    12 Weltanschauungen
                </ThemedText>
                {currentWeltanschauung &&
                    currentAutor &&
                    currentGedanke &&
                    deviceType &&
                    (isWeb && deviceType !== 'webSmall' ? (
                        <WebGedankenView
                            styles={styles}
                            currentWeltanschauung={currentWeltanschauung}
                            currentAutor={currentAutor}
                            currentGedanke={currentGedanke}
                            deviceType={deviceType}
                        />
                    ) : (
                        <MobileGedankenView
                            styles={styles}
                            currentWeltanschauung={currentWeltanschauung}
                            currentAutor={currentAutor}
                            currentGedanke={currentGedanke}
                            deviceType={deviceType}
                            dynamicFontSize={dynamicFontSize}
                            handleNavigateToNextScreen={
                                handleNavigateToNextScreen
                            }
                        />
                    ))}
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
        </ThemedView>
    );
}

const getScreenProfiles = (): Record<DeviceType, ScreenProfiles> => {
    const dimensions = Dimensions.get('window');
    const width = dimensions.width;

    return {
        smartphone: {
            container: {
                flexDirection: 'column',
                marginTop: 40,
                titleHeight: 50,
            },
            titleTextWeltanschauungen: {
                marginTop: 5,
                fontSize: 32,
            },
            scrollAuswahl: {
                itemHeight: 60,
                visibleItems: 3,
                fontSize: 20,
            },
            auswahlRad: {
                circleSize: 820,
                circleOffsetX: -210,
                circleOffsetY: 150,
                minTapDistanceFromCenter: 20,
                autorImageSize: 170,
                autorImageSizeLarge: 220,
                autorImageRadius: 22,
                autorImageRadiusLarge: 8,
            },
            canvasViewContainer: {
                marginTop: 190,
            },
            canvasWeltanschauungTitle: {
                fontSize: 28,
            },
            canvasGedankeKurzLabel: {
                fontSize: 14,
            },
            canvasGedankeKurz: {
                fontSize: 18,
            },
        },
        tablet: {
            container: {
                flexDirection: 'column',
                marginTop: 20,
                titleHeight: 50,
            },
            titleTextWeltanschauungen: {
                fontSize: 32,
            },
            auswahlRad: {
                circleSize: 722,
                circleOffsetX: 300,
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
            container: {
                flexDirection: 'column',
                marginTop: 0,
                titleHeight: 50,
            },
            titleTextWeltanschauungen: {
                marginTop: 5,
                fontSize: 26,
            },
            scrollAuswahl: {
                itemHeight: 42,
                visibleItems: 3,
                fontSize: 20,
            },
            auswahlRad: {
                circleSize: 820,
                circleOffsetX: 0.486 * width - 403,
                circleOffsetY: 140,
                minTapDistanceFromCenter: 20,
                autorImageSize: 170,
                autorImageSizeLarge: 220,
                autorImageRadius: 22,
                autorImageRadiusLarge: 8,
            },
            canvasViewContainer: {
                marginTop: 170,
            },
            canvasWeltanschauungTitle: {
                fontSize: 28,
            },
            canvasGedankeKurzLabel: {
                fontSize: 14,
            },
            canvasGedankeKurz: {
                fontSize: 18,
                marginHorizontal: '7%',
            },
        },
        webMedium: {
            container: {
                flexDirection: 'row',
                marginTop: 0,
                titleHeight: 60,
                padding: 16,
            },
            gedankenfehlerContainer: { paddingRight: 16 },
            titleTextWeltanschauungen: {
                fontSize: 32,
            },
            scrollAuswahl: {
                itemHeight: 80,
                visibleItems: 10,
                fontSize: 20,
            },
            auswahlRad: {
                circleSize: 1040,
                circleOffsetX: 0.298 * width - 540,
                circleOffsetY: 130,
                minTapDistanceFromCenter: 20,
                autorImageSize: 170,
                autorImageSizeLarge: 220,
                autorImageRadius: 25,
                autorImageRadiusLarge: 12,
            },
            canvasViewContainer: {
                marginTop: 210,
            },
            canvasWeltanschauungTitle: {
                fontSize: 24,
            },
            canvasGedankeKurzLabel: {
                fontSize: 12,
            },
            canvasGedankeKurz: {
                fontSize: 18,
                marginVertical: 10,
                marginHorizontal: '10%',
            },
            canvasGedanke: {
                fontSize: 18,
                marginVertical: 15,
            },
        },
        webLarge: {
            container: {
                flexDirection: 'row',
                marginTop: 0,
                titleHeight: 60,
                padding: 16,
            },
            gedankenfehlerContainer: { paddingRight: 16 },
            titleTextWeltanschauungen: {
                fontSize: 32,
            },
            scrollAuswahl: {
                itemHeight: 80,
                visibleItems: 10,
                fontSize: 26,
            },
            auswahlRad: {
                circleSize: 1040,
                circleOffsetX: 0.298 * width - 540,
                circleOffsetY: 130,
                minTapDistanceFromCenter: 20,
                autorImageSize: 170,
                autorImageSizeLarge: 220,
                autorImageRadius: 25,
                autorImageRadiusLarge: 12,
            },
            canvasViewContainer: {
                marginTop: 210,
            },
            canvasWeltanschauungTitle: {
                fontSize: 28,
            },
            canvasGedankeKurzLabel: {
                fontSize: 14,
            },
            canvasGedankeKurz: {
                fontSize: 20,
                marginVertical: 10,
                marginHorizontal: '20%',
            },
            canvasGedanke: {
                fontSize: 20,
                marginVertical: 20,
            },
        },
    };
};

// Theme-aware styles
const getStyles = (deviceProfile: ScreenProfiles) => {
    const colorScheme = useColorScheme();
    const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
    const flexDirection = deviceProfile.container?.flexDirection || 'column';

    return StyleSheet.create({
        // Layout container
        container: {
            flex: 1,
            flexDirection,
            marginTop: deviceProfile.container?.marginTop || 0,
            padding: deviceProfile.container?.padding || 0,
        },
        gedankenfehlerContainer: {
            width: flexDirection === 'row' ? '40%' : '100%',
            paddingRight:
                deviceProfile.gedankenfehlerContainer?.paddingRight || 0,
            position: 'relative',
            alignItems: 'center',
        },
        weltanschuungenContainer: {
            position: 'relative',
            width: flexDirection === 'row' ? '60%' : windowWidth,
            overflow: flexDirection === 'row' ? 'hidden' : 'visible',
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
            padding: 5,
            marginBottom: 10,
            fontFamily: 'OverlockBold',
            fontSize: deviceProfile.titleTextWeltanschauungen?.fontSize || 32,
            lineHeight:
                (deviceProfile.titleTextWeltanschauungen?.fontSize || 32) *
                    1.5 || 48,
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
            fontSize: deviceProfile.titleTextWeltanschauungen?.fontSize || 32,
            lineHeight:
                (deviceProfile.titleTextWeltanschauungen?.fontSize || 32) *
                    1.5 || 48,
            marginTop: deviceProfile.titleTextWeltanschauungen?.marginTop || 0,
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
            marginTop: deviceProfile.canvasViewContainer?.marginTop || 190,
            marginLeft: deviceProfile.canvasViewContainer?.marginLeft || 0,
            zIndex: 10,
            alignSelf: 'center',
        },
        canvasWeltanschauungContainer: {
            // Size and positioning
            position: 'relative',
            width: '95%',
            paddingHorizontal: 0,
            paddingBottom: 20,
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden',
            alignSelf: 'center',

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
            marginBottom: 30,
        },
        canvasWeltanschauungTitle: {
            fontFamily: 'OverlockBold',
            fontSize: deviceProfile.canvasWeltanschauungTitle?.fontSize || 42,
            marginTop: 15,
            lineHeight:
                (deviceProfile.canvasWeltanschauungTitle?.fontSize || 28) * 1.5,
            color: TabsColors[theme].weltanschauungenDefaultColor,
            textAlign: 'center',
        },
        canvasGedankeKurzLabel: {
            fontFamily: 'OverlockRegular',
            fontSize: deviceProfile.canvasGedankeKurzLabel?.fontSize || 14,
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
            fontSize: deviceProfile.canvasGedankeKurz?.fontSize || 24,
            lineHeight: (deviceProfile.canvasGedankeKurz?.fontSize || 24) * 1.5,
            color: TabsColors[theme].weltanschauungenDefaultColor,
            textAlign: 'center',
            marginHorizontal: deviceProfile.canvasGedankeKurz?.marginHorizontal,
            marginVertical:
                deviceProfile.canvasGedankeKurz?.marginVertical ?? 0,
            backgroundColor: 'transparent',
        },
        canvasGedanke: {
            fontFamily: 'OverlockRegular',
            fontSize: deviceProfile.canvasGedanke?.fontSize || 24,
            lineHeight: (deviceProfile.canvasGedanke?.fontSize || 24) * 1.45,
            color: TabsColors[theme].weltanschauungenDefaultColor,
            textAlign: 'justify',
            backgroundColor: 'transparent',
            marginVertical: deviceProfile.canvasGedanke?.marginVertical ?? 0,
            paddingHorizontal: 15,
        },

        // Auswahl wheel
        auswahlradContainer: {
            position: 'absolute',
            backgroundColor: 'transparent',
        },
    });
};
