import React, { useState, useMemo, useRef, useEffect, useContext } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { TabsColors } from '@/constants/TabsColors';
import { Weltanschauungen } from '@/constants/Weltanschauungen';
import { DatabaseContext, SessionContext } from '../../providers';
import KommentarKreuz from '@/components/KommentarKreuz/KommentarKreuz';
import { Reaction, ReactionType } from '@/types';
import { useBewertungen } from '@/hooks/useBewertungen';
import { ThemedView } from '@/components/ThemedView';
import { AuswahlRad } from '@/components/Auswahlrad/index';
import {
    useDeviceProfile,
    aufloesungScreenProfiles,
} from '@/utils/DeviceProfiles';

// AuswahlRad config for right bottom corner
// Now handled by device profiles

const reactions: Reaction[] = [
    { type: 'interesse', color: 'rgba(255, 255, 255, 0.6)', count: null },
    { type: 'zustimmung', color: 'rgba(6, 154, 26, 0.6)', count: null },
    { type: 'wut', color: 'rgba(208, 12, 68, 0.6)', count: null },
    { type: 'ablehnung', color: 'rgba(5, 40, 46, 0.6)', count: null },
    { type: 'inspiration', color: 'rgba(235, 201, 50, 0.6)', count: null },
];

const Gedankenkarte = () => {
    const router = useRouter();
    const styles = getStyles();
    const [showCommentWheel, setShowCommentWheel] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Get device profile
    const deviceProfile = useDeviceProfile(aufloesungScreenProfiles);
    const auswahlRadOptions = deviceProfile.auswahlRad;
    const kommentarKreuzOptions = deviceProfile.kommentarKreuz;

    // Replace API hooks with context
    const {
        gedanken: allGedanken,
        autoren: allAutoren,
        isLoadingGedanken,
        isLoadingAutoren,
        errorGedanken,
        errorAutoren,
        weltanschauungIndex,
        setWeltanschauungIndex,
        nummer,
        setNummer,
    } = useContext(DatabaseContext);

    // Reset scroll position when weltanschauungIndex changes
    const prevWeltanschauungIndexRef = useRef(weltanschauungIndex);
    useEffect(() => {
        if (prevWeltanschauungIndexRef.current !== weltanschauungIndex) {
            prevWeltanschauungIndexRef.current = weltanschauungIndex;
            // Reset scroll position to top
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
    }, [weltanschauungIndex]);

    // Reset scroll position when nummer changes
    const prevNummerRef = useRef(nummer);
    useEffect(() => {
        if (prevNummerRef.current !== nummer) {
            prevNummerRef.current = nummer;
            // Reset scroll position to top
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
    }, [nummer]);

    const { menschId } = useContext(SessionContext);

    // Filter gedanken based on current weltanschauung and nummer
    const gedanken = useMemo(
        () =>
            allGedanken?.filter(
                (g) =>
                    g.weltanschauung ===
                        Weltanschauungen[weltanschauungIndex] &&
                    g.nummer === nummer
            ) || [],
        [allGedanken, weltanschauungIndex, nummer]
    );

    const nextGedankeExists = useMemo(() => {
        return allGedanken?.some(
            (g) =>
                g.weltanschauung === Weltanschauungen[weltanschauungIndex] &&
                g.nummer === nummer + 1
        );
    }, [allGedanken, weltanschauungIndex, nummer]);

    // Just pull out the first gedanke (if any):
    const gedanke = gedanken[0];
    const {
        gedanke: gedankeText,
        ausgangsgedanke_in_weltanschauung: gedankenfehlerText,
    } = gedanke || {};

    // Always call the hook but with a safe value when gedanke?.id is not available
    const {
        aggregierteBewertungen,
        isLoading: isLoadingBewertungen,
        setBewertung,
    } = useBewertungen<ReactionType>(gedanke?.id || '');

    // Memoize the reactions array to prevent unnecessary re-renders
    const memoizedReactions = useMemo(() => reactions, []);

    const [aggregatedReactions, setAggregatedReactions] =
        useState<Reaction[]>(memoizedReactions);

    // Memoize the aggregated reactions to prevent unnecessary re-renders
    const memoizedAggregatedReactions = useMemo(() => {
        return memoizedReactions.map((reaction: Reaction) => ({
            ...reaction,
            count: aggregierteBewertungen[reaction.type] || 0,
        }));
    }, [aggregierteBewertungen, memoizedReactions]);

    // Set the aggregated reactions only once when memoizedAggregatedReactions changes
    useEffect(() => {
        setAggregatedReactions(memoizedAggregatedReactions);
    }, [memoizedAggregatedReactions]);

    // Get autor for the current gedanke
    const autor = useMemo(
        () => allAutoren?.find((a) => a.id === gedanke?.autorId),
        [allAutoren, gedanke]
    );

    const handleCommentSelect = async (direction: ReactionType) => {
        if (menschId && gedanke) {
            try {
                await setBewertung({
                    id: Math.random().toString(36).substring(7),
                    bewertungs_typ: direction,
                    gedankeId: gedanke.id,
                    autorId: gedanke.autorId,
                    nummer: nummer.toString(),
                    menschId,
                });
            } catch (error) {
                console.error('Error submitting bewertung:', error);
            }
        }
    };

    const handleNavigateToGedankenfehlerScreen = () => {
        router.push('/(tabs)/GedankenfehlerScreen');
    };

    function addFullstopIfMissing(gedankeText: string): React.ReactNode {
        if (!gedankeText) return '';

        // Check if the text already ends with punctuation
        const punctuationMarks = ['.', '!', '?', ':', ';', '…'];
        const lastChar = gedankeText.trim().slice(-1);

        if (punctuationMarks.includes(lastChar)) {
            return gedankeText;
        } else {
            return gedankeText + '.';
        }
    }

    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                {!isLoadingGedanken && !errorGedanken && (
                    <>
                        <View style={styles.arrowContainerLeft}>
                            <TouchableOpacity
                                onPress={() =>
                                    setNummer(Math.max(1, nummer - 1))
                                }
                                hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                }}
                                style={styles.arrowTouchable}
                            >
                                <Image
                                    source={require('@/assets/images/arrow-left.png')}
                                    style={styles.navigationArrow}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.arrowContainerRight}>
                            <TouchableOpacity
                                onPress={() =>
                                    nextGedankeExists && setNummer(nummer + 1)
                                }
                                hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                }}
                                style={styles.arrowTouchable}
                            >
                                <Image
                                    source={require('@/assets/images/arrow-right.png')}
                                    style={styles.navigationArrow}
                                />
                            </TouchableOpacity>
                        </View>

                        <ThemedView style={styles.textContainer}>
                            <View style={styles.gedankenfehlerContainer}>
                                <Text style={styles.gedankenfehler}>
                                    {addFullstopIfMissing(gedankenfehlerText) ||
                                        ''}
                                </Text>
                            </View>

                            <ScrollView
                                ref={scrollViewRef}
                                contentContainerStyle={styles.scrollViewContent}
                            >
                                <TouchableOpacity
                                    onPress={
                                        handleNavigateToGedankenfehlerScreen
                                    }
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.gedanke}>
                                        {gedankeText || ''}
                                        {'\n'}
                                        {'\n'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </ThemedView>
                        <ThemedView style={styles.commentContainer}>
                            <TouchableOpacity
                                onPress={() => setShowCommentWheel(true)}
                            >
                                <Image
                                    source={require('@/assets/images/comment-wheel-icon.png')}
                                    style={styles.commentChoiceVoter}
                                />
                            </TouchableOpacity>
                            <KommentarKreuz
                                reactions={aggregatedReactions}
                                isVisible={showCommentWheel}
                                onClose={() => setShowCommentWheel(false)}
                                onSelect={handleCommentSelect}
                                options={kommentarKreuzOptions}
                            />
                        </ThemedView>
                    </>
                )}
            </View>

            <>
                {!isLoadingAutoren && !errorAutoren && gedanke && (
                    <View style={styles.autorOverlayContainer}>
                        <Text style={styles.weltanschauung}>
                            {gedanke.weltanschauung}
                        </Text>
                        {autor && (
                            <ThemedText style={styles.autorName}>
                                {autor.name}
                            </ThemedText>
                        )}
                    </View>
                )}

                {isLoadingAutoren && <ThemedText>Loading...</ThemedText>}

                {errorAutoren && (
                    <ThemedText style={styles.error}>
                        {errorAutoren.message}
                    </ThemedText>
                )}
            </>

            <ThemedView
                style={[
                    styles.auswahlradContainer,
                    {
                        left: auswahlRadOptions.circleOffsetX,
                        top: auswahlRadOptions.circleOffsetY,
                    },
                ]}
            >
                {allAutoren && (
                    <AuswahlRad
                        allAutoren={allAutoren}
                        weltanschauungIndex={weltanschauungIndex}
                        setWeltanschauungIndex={setWeltanschauungIndex}
                        options={auswahlRadOptions}
                    />
                )}
            </ThemedView>
        </View>
    );
};

// Theme-aware styles
const getStyles = () => {
    // const colorScheme = useColorScheme();
    // const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
    const theme = 'light';
    const themeColors = TabsColors[theme];

    return StyleSheet.create({
        // Layout and containers
        container: {
            flex: 1,
            padding: 16,
            height: '100%',
            width: '100%',
        },
        textContainer: {
            height: 620,
            marginTop: 30,
            padding: 20,
            borderWidth: 0.5,
            borderRadius: 20,
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
            shadowColor: themeColors.weltanschauungenDefaultColor,
            shadowOffset: { width: 6, height: 10 },
            shadowOpacity: 1,
            shadowRadius: 5,
            elevation: 8,
        },
        pageOfGedanke: {
            flex: 1,
            marginTop: 30,
            padding: 20,
            borderWidth: 0.5,
            borderRadius: 20,
            backgroundColor: themeColors.cardBackground,
            height: '80%',
        },
        autorOverlayContainer: {
            position: 'absolute',
            width: 260,
            height: 85,
            backgroundColor: themeColors.autorOverlayContainerBackgroundColor,
            borderRadius: 20,
            borderWidth: 0,
            borderColor: 'red',
            bottom: 5,
            left: 16,
            zIndex: 20,
        },
        auswahlradContainer: {
            position: 'absolute',
            right: 0,
            bottom: 0,
            zIndex: 10,
        },
        error: {
            color: 'red',
            marginTop: 10,
        },

        gedankenfehler: {
            fontSize: 18,
            fontFamily: 'OverlockRegular',
            color: themeColors.gedankenfehlerDefaultColor,
            textAlign: 'center',
            flex: 1,
        },
        gedanke: {
            fontSize: 22,
            fontFamily: 'OverlockRegular',
            alignItems: 'center',
            textAlign: 'justify',
            color: themeColors.weltanschauungenDefaultColor,
        },
        commentContainer: {
            position: 'absolute',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            width: 100,
            borderRadius: 100,
            bottom: 115,
            left: -10,
            zIndex: 15,
        },
        comment: {
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            fontSize: 28,
            textAlign: 'center',
            alignSelf: 'center',
            width: '100%',
            letterSpacing: 6,
        },
        commentChoices: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
        },
        commentChoiceOk: {
            fontSize: 40,
        },
        commentChoiceVoter: {
            width: 80,
            height: 80,
        },

        // Author information
        weltanschauung: {
            fontFamily: 'OverlockBold',
            fontSize: 28,
            color: themeColors.weltanschauungenDefaultColor,
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 10,
        },
        autorName: {
            fontFamily: 'OverlockRegular',
            color: themeColors.weltanschauungenDefaultColor,
            fontSize: 18,
            textAlign: 'center',
            marginTop: -5,
        },
        model: {
            fontSize: 10,
            textAlign: 'center',
            marginTop: 4,
            marginBottom: 5,
        },
        bottomTexts: {
            position: 'absolute',
            bottom: 0,
            left: 30,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        gedankenfehlerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 22,
            marginBottom: 15,
        },
        navigationArrow: {
            width: 40,
            height: 24,
            tintColor: themeColors.gedankenfehlerDefaultColor,
        },
        arrowTouchable: {
            padding: 8,
        },
        scrollViewContent: {
            paddingVertical: 10,
        },
        arrowContainerLeft: {
            position: 'absolute',
            left: -15,
            top: 50,
            zIndex: 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        arrowContainerRight: {
            position: 'absolute',
            right: -15,
            top: 50,
            zIndex: 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
};

export default Gedankenkarte;
