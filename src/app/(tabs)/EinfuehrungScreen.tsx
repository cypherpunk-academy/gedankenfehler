import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import React, { useRef, useState } from 'react';
import einführung from '../../assets/stories/einfuehrung.json';
import künstlicheIntelligenz from '../../assets/stories/künstlicheIntelligenz.json';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import {
    useDeviceProfile,
    einfuehrungScreenProfiles,
} from '@/utils/DeviceProfiles';

type EinführungStory = {
    text: string;
    duration: number;
};

const einführungStories: EinführungStory[] = einführung.story;
const kiStories: EinführungStory[] = künstlicheIntelligenz.story;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function EinfuehrungScreen() {
    // Get device profile
    const deviceProfile = useDeviceProfile(einfuehrungScreenProfiles);
    const auswahlRadOptions = deviceProfile.auswahlRad;

    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [isLastSlide, setIsLastSlide] = useState(false);
    const [isSwipingFromLastSlide, setIsSwipingFromLastSlide] = useState(false);
    const [currentStory, setCurrentStory] =
        useState<EinführungStory[]>(einführungStories);
    const [currentBackground, setCurrentBackground] = useState(
        require('../../assets/images/intro-background.jpg')
    );
    const [isInitialAppLaunch, setIsInitialAppLaunch] = useState(true);

    // Reset carousel when tab is focused
    useFocusEffect(
        React.useCallback(() => {
            // When this screen is focused (not at initial app launch), it's being accessed from within the app
            setIsInitialAppLaunch(false);

            // Reset to first slide and restart animation
            setActiveIndex(0);
            setProgress(0);
            setIsSwipingFromLastSlide(false);
            if (carouselRef.current) {
                // @ts-ignore - scrollTo method exists but TypeScript doesn't recognize it
                carouselRef.current.scrollTo({ index: 0, animated: false });
            }
            // Check if it's the last slide when carousel is focused
            setIsLastSlide(activeIndex === currentStory.length - 1);
        }, [])
    );

    const handleSnapToItem = (index: number) => {
        if (activeIndex === index) {
            router.push('/');
        }
        setActiveIndex(index);
        // Update isLastSlide state when the slide changes
        setIsLastSlide(index === currentStory.length - 1);
        setIsSwipingFromLastSlide(false);
    };

    const backgroundStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: progress * screenWidth * 0.0004 }],
        };
    });

    const handleOnScrollStart = () => {
        if (activeIndex === currentStory.length - 1) {
            setIsSwipingFromLastSlide(true);
        }
        setIsLastSlide(activeIndex === currentStory.length - 1);
    };

    const showKIStory = () => {
        setCurrentStory(kiStories);
        setCurrentBackground(require('../../assets/images/ai-background.jpg'));
        setActiveIndex(0);
        if (carouselRef.current) {
            // @ts-ignore - scrollTo method exists but TypeScript doesn't recognize it
            carouselRef.current.scrollTo({ index: 0, animated: false });
        }
        setIsLastSlide(false);
        setIsSwipingFromLastSlide(false);
    };

    const showEinfuehrungStory = () => {
        setCurrentStory(einführungStories);
        setCurrentBackground(
            require('../../assets/images/intro-background.jpg')
        );
        setActiveIndex(0);
        if (carouselRef.current) {
            // @ts-ignore - scrollTo method exists but TypeScript doesn't recognize it
            carouselRef.current.scrollTo({ index: 0, animated: false });
        }
        setIsLastSlide(false);
        setIsSwipingFromLastSlide(false);
    };

    const renderItem = ({
        item,
        index,
    }: {
        item: EinführungStory;
        index: number;
    }) => (
        <View style={styles.slide}>
            <View
                style={[
                    styles.textContainer,
                    {
                        backgroundColor:
                            currentStory === einführungStories
                                ? 'rgba(0, 0, 0, 0.2)'
                                : 'rgba(0, 0, 0, 0.4)',
                    },
                    isSwipingFromLastSlide &&
                        currentStory === einführungStories && {
                            backgroundColor: 'rgba(255, 0, 0, 0.2)',
                        },
                ]}
            >
                <Text style={styles.text}>{item.text}</Text>
            </View>
        </View>
    );

    // Show button if we're on the last slide during initial app launch OR anytime when accessed from within the app
    const shouldShowButton =
        (isLastSlide && currentStory === einführungStories) ||
        !isInitialAppLaunch;

    // Helper function to calculate text size based on device type
    const getTextSize = () => {
        const deviceType =
            auswahlRadOptions.circleSize < 700 ? 'smartphone' : 'tablet';
        return deviceType === 'smartphone' ? 18 : 22;
    };

    const fontSize = getTextSize();

    return (
        <View style={styles.container}>
            <Animated.Image
                source={currentBackground}
                style={[styles.backgroundImage, backgroundStyle]}
            />
            <Carousel<EinführungStory>
                ref={carouselRef}
                loop={false}
                width={screenWidth}
                height={screenHeight}
                data={currentStory}
                renderItem={renderItem}
                onSnapToItem={handleSnapToItem}
                onScrollStart={handleOnScrollStart}
                autoPlay={true}
                autoPlayInterval={currentStory[activeIndex].duration * 1000}
                onProgressChange={(progress: number) => setProgress(progress)}
            />
            {shouldShowButton && (
                <TouchableOpacity
                    style={[
                        styles.storyButton,
                        currentStory === kiStories && styles.blueStoryButton,
                    ]}
                    onPress={
                        currentStory === einführungStories
                            ? showKIStory
                            : showEinfuehrungStory
                    }
                >
                    <Text style={[styles.buttonText, { fontSize }]}>
                        {currentStory === einführungStories
                            ? 'Über die App'
                            : 'Einführung'}
                    </Text>
                </TouchableOpacity>
            )}
            <View style={styles.pagination}>
                {currentStory.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === activeIndex && styles.paginationDotActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        position: 'absolute',
        width: screenWidth * 3,
        height: '100%',
        resizeMode: 'contain',
        left: -100,
    },
    textContainer: {
        padding: 20,
        borderRadius: 10,
        margin: 20,
    },
    text: {
        color: 'white',
        fontSize: 22,
        textAlign: 'center',
        lineHeight: 34,
        fontFamily: 'OverlockRegular',
        marginBottom: 10,
    },
    pagination: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 24,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        margin: 3,
    },
    paginationDotActive: {
        backgroundColor: 'white',
    },
    storyButton: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    blueStoryButton: {
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
    },
    buttonText: {
        color: 'white',
        fontFamily: 'OverlockRegular',
    },
});
