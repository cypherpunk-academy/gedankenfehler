import React, { useCallback, useRef, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    Pressable,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Text,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    useAnimatedScrollHandler,
    runOnJS,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface ScrollPickerProps {
    items?: Array<{ nummer: number; ausgangsgedanke: string }>;
    selectedValue: number;
    onValueChange: (value: number) => void;
    onScrollPositionChange?: (position: number) => void;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScrollAuswahl({
    items = [],
    selectedValue,
    onValueChange,
    onScrollPositionChange,
}: ScrollPickerProps) {
    const scrollY = useSharedValue(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const isScrolling = useSharedValue(false);
    const isSnapping = useRef(false);

    // Move scroll logic to a separate function
    const scrollToPosition = useCallback((y: number) => {
        if (scrollViewRef.current && y >= 0 && !isSnapping.current) {
            isSnapping.current = true;
            scrollViewRef.current?.scrollTo({ y, animated: true });
            // Reset the snapping flag after a short delay
            setTimeout(() => {
                isSnapping.current = false;
            }, 100);
        }
    }, []);

    useEffect(() => {
        if (items.length > 0) {
            if (!selectedValue) {
                // If no value selected, select the first item
                onValueChange(items[0].nummer);
                scrollToPosition(0);
            } else {
                // Find the index of the selected item and scroll to it
                const selectedIndex = items.findIndex(
                    (item) => item.nummer === selectedValue
                );
                if (selectedIndex !== -1) {
                    scrollToPosition(selectedIndex * ITEM_HEIGHT);
                }
            }
        }
    }, [items, selectedValue, onValueChange, scrollToPosition]);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
            if (onScrollPositionChange) {
                runOnJS(onScrollPositionChange)(scrollY.value);
            }
        },
        onBeginDrag: () => {
            isScrolling.value = true;
        },
        onEndDrag: () => {
            isScrolling.value = false;
        },
    });

    const onMomentumScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (isSnapping.current) return;

            const y = event.nativeEvent.contentOffset.y;
            const index = Math.round(y / ITEM_HEIGHT);
            const snapToY = index * ITEM_HEIGHT;

            // Handle both the scroll position and value change
            scrollToPosition(snapToY);
            if (items[index]) {
                onValueChange(items[index].nummer);
            }
        },
        [items, onValueChange, scrollToPosition]
    );

    // Create a component for each item to properly scope the hooks
    const AnimatedItem = useCallback(
        ({ item, index }: { item: (typeof items)[0]; index: number }) => {
            const animatedStyle = useAnimatedStyle(() => {
                const inputRange = [
                    (index - 2) * ITEM_HEIGHT,
                    (index - 1) * ITEM_HEIGHT,
                    index * ITEM_HEIGHT,
                    (index + 1) * ITEM_HEIGHT,
                    (index + 2) * ITEM_HEIGHT,
                ];

                const scale = interpolate(
                    scrollY.value,
                    inputRange,
                    [0.8, 0.9, 1, 0.9, 0.8],
                    'clamp'
                );

                const opacity = interpolate(
                    scrollY.value,
                    inputRange,
                    [0.3, 0.5, 1, 0.5, 0.3],
                    'clamp'
                );

                const translateX = interpolate(
                    scrollY.value,
                    inputRange,
                    [20, 10, 0, 10, 20],
                    'clamp'
                );

                return {
                    transform: [{ scale }, { translateX }],
                    opacity,
                };
            });

            return (
                <AnimatedPressable
                    key={item.nummer}
                    style={[styles.item, animatedStyle]}
                    onPress={() => {
                        scrollToPosition(index * ITEM_HEIGHT);
                        onValueChange(item.nummer);
                    }}
                >
                    <ThemedText
                        style={[
                            styles.itemText,
                            selectedValue === item.nummer &&
                                styles.selectedItemText,
                        ]}
                    >
                        {`${item.nummer}: ${item.ausgangsgedanke}`}
                    </ThemedText>
                </AnimatedPressable>
            );
        },
        [scrollY, scrollToPosition, onValueChange, selectedValue]
    );

    if (!items || items.length === 0) {
        return (
            <View style={styles.container}>
                <ThemedText style={styles.itemText}>
                    No items available
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AnimatedScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onMomentumScrollEnd={onMomentumScrollEnd}
            >
                {items.map((item, index) => (
                    <AnimatedItem
                        key={`item-${item.nummer}`}
                        item={item}
                        index={index}
                    />
                ))}
            </AnimatedScrollView>
            <View style={styles.centerOverlay} pointerEvents="none" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: CONTAINER_HEIGHT,
        width: WINDOW_WIDTH - 32,
        overflow: 'hidden',
    },
    scrollView: {
        height: CONTAINER_HEIGHT,
    },
    scrollContent: {
        paddingVertical: CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2,
    },
    item: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    itemText: {
        fontSize: 18,
        fontFamily: 'OverlockRegular',
        textAlign: 'center',
        color: 'rgb(169, 22, 22)',
    },
    selectedItemText: {
        fontFamily: 'OverlockBold',
    },
    centerOverlay: {
        position: 'absolute',
        top: CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        backgroundColor: 'rgba(200, 200, 200, 0.1)',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(200, 200, 200, 0.2)',
    },
});
