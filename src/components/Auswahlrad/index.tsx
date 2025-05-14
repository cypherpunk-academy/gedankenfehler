import React, { useEffect, useRef } from 'react';
import {
    Animated,
    View,
    Image,
    Pressable,
    Dimensions,
    StyleSheet,
    useColorScheme,
} from 'react-native';
import { AutorImages } from '@/constants/Weltanschauungen';
import { PanResponder } from 'react-native';

import { Autor } from '../../../packages/backend/src/models/Autor';
import { Colors } from './Colors';

const windowWidth = Dimensions.get('window').width;

/**
 * Configuration options for the AuswahlRad (selection wheel) component
 */
type AuswahlradOptions = {
    circleOffsetX: number; // X offset of the circle from its container
    circleOffsetY: number; // Y offset of the circle from its container
    minTapDistanceFromCenter: number; // Minimum distance from center to register touch events
    autorImageSize: number; // Size of regular author images
    autorImageRadius: number; // Distance of regular images from center
    autorImageSizeLarge: number; // Size of selected author image
    autorImageRadiusLarge: number; // Distance of selected image from center
    circleSize: number; // Overall diameter of the wheel
};

/**
 * Props for the AuswahlRad component
 */
type AuswahlradProps = {
    allAutoren: Autor[] | null; // Array of authors to display on the wheel
    weltanschauungIndex: number; // Current selected index/position (0-11)
    setWeltanschauungIndex: (index: number) => void; // Callback to update selected index
    options: AuswahlradOptions; // Configuration options
};

/**
 * AuswahlRad (Selection Wheel) - An interactive rotating wheel component that displays
 * authors in a circular arrangement and allows selection through rotation or direct tap.
 * The wheel contains 12 positions (representing different worldviews/authors).
 */
export function AuswahlRad({
    allAutoren,
    weltanschauungIndex,
    setWeltanschauungIndex,
    options,
}: AuswahlradProps) {
    const styles = getStyles(options);

    const {
        circleSize = 200,
        circleOffsetX,
        circleOffsetY,
        minTapDistanceFromCenter,
        autorImageSize,
        autorImageSizeLarge,
        autorImageRadius,
        autorImageRadiusLarge,
    } = options;

    // Center coordinates of the circle
    const circleCenterX = circleSize / 2;
    const circleCenterY = circleSize / 2;

    // References to track rotation and gesture state
    const circleRef = useRef(null);
    const weltanschauungIndexRef = useRef(weltanschauungIndex);
    const initialRotationRef = useRef(0); // Starting rotation value when gesture begins
    const initialAngleRef = useRef(0); // Starting angle when gesture begins
    const lastAngleRef = useRef(0); // Most recent angle during gesture
    const rotateValueFinalRef = useRef(0); // Final rotation value after animation
    const rotateValueRef = useRef(0); // Current rotation value during gesture
    const rotateAnim = useRef(new Animated.Value(0)).current; // Animation driver
    const minAngleChange = 0.5; // Minimum angle change to trigger rotation update
    const lastTapTimeRef = useRef(0); // Track the last tap time for double tap detection
    const lastPanReleaseTimeRef = useRef(0);

    // Initialize rotation value when component mounts or screen changes
    useEffect(() => {
        // Calculate rotation value based on the initial weltanschauungIndex
        const newValue = (12 - weltanschauungIndex) % 12;
        rotateValueFinalRef.current = newValue;
        rotateValueRef.current = newValue;
        rotateAnim.setValue(newValue);
    }, []);

    useEffect(() => {
        if (weltanschauungIndexRef.current !== weltanschauungIndex) {
            // Update the ref immediately to prevent unnecessary re-renders
            weltanschauungIndexRef.current = weltanschauungIndex;

            // Calculate rotation value (12 - index to make selected item appear at top)
            const newValue = (12 - weltanschauungIndex) % 12;
            rotateValueFinalRef.current = newValue;

            console.log(1, 'index.tsx:96', {
                weltanschauungIndex,
                newValue,
            });

            // Calculate the shortest rotation path
            let distance = Math.abs(rotateValueRef.current - newValue);
            if (distance > 6) {
                distance = 12 - distance; // Take shorter path around the circle
            }

            // Animate the wheel to the new position with improved tension for smoother animation
            Animated.spring(rotateAnim, {
                toValue: newValue,
                friction: 6,
                tension: Math.max(
                    40,
                    40 + minTapDistanceFromCenter / Math.max(0.1, distance)
                ),
                useNativeDriver: false,
                velocity: 0.5,
            }).start();
        }
    }, [weltanschauungIndex, minTapDistanceFromCenter]);

    // Map 0-12 rotation values to 0-360 degrees for smoother animation
    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 12],
        outputRange: ['0deg', '360deg'],
    });

    const animatedStyle = {
        transform: [{ rotate: rotateInterpolate }],
    };

    /**
     * Handle direct tap on an author image
     * Animates the wheel to position the selected author at the top
     */
    const handleAutorPress = (index: number) => {
        // Prevent tap handling if it occurs within 250ms after a pan gesture
        if (Date.now() - lastPanReleaseTimeRef.current < 250) {
            return;
        }

        const now = Date.now();
        const isSelectedAutor = index === weltanschauungIndexRef.current;

        console.log(1, 'index.tsx:144', { index });

        // If this is a double tap on the selected author (within 300ms), jump to opposite position
        if (isSelectedAutor && now - lastTapTimeRef.current < 300) {
            // Calculate the opposite position (add 6 positions, mod 12 to keep within 0-11 range)
            const oppositeIndex = (index + 6) % 12;
            setWeltanschauungIndex(oppositeIndex);
            weltanschauungIndexRef.current = oppositeIndex;

            // Calculate rotation value for opposite position
            const newValue = (12 - oppositeIndex) % 12;
            rotateValueFinalRef.current = newValue;

            // Animate with a more dynamic motion to emphasize the jump
            Animated.spring(rotateAnim, {
                toValue: newValue,
                friction: 6,
                tension: 60, // Higher tension for quicker motion
                useNativeDriver: false,
                velocity: 1.5, // Higher initial velocity
            }).start();

            // Reset tap time
            lastTapTimeRef.current = 0;
            return;
        }

        // Update tap time for potential double tap detection
        lastTapTimeRef.current = isSelectedAutor ? now : 0;

        // Only update if the index is different (for single taps)
        if (weltanschauungIndexRef.current !== index) {
            // Update weltanschauung index
            console.log(1, 'index.tsx:175', {
                weltanschauungIndex: weltanschauungIndexRef.current,
                index,
            });
            setWeltanschauungIndex(index);
            weltanschauungIndexRef.current = index;

            // Calculate rotation value (12 - index to make selected item appear at top)
            const newValue = (12 - index) % 12;
            rotateValueFinalRef.current = newValue;

            // Calculate the shortest rotation path
            let distance = Math.abs(rotateValueRef.current - newValue);
            if (distance > 6) {
                distance = 12 - distance; // Take shorter path around the circle
            }

            // Animate the wheel to the new position
            Animated.spring(rotateAnim, {
                toValue: newValue,
                friction: 6,
                tension: Math.max(
                    40,
                    minTapDistanceFromCenter +
                        minTapDistanceFromCenter / Math.max(0.1, distance)
                ),
                useNativeDriver: false,
                velocity: 0.5,
            }).start();
        }
    };

    /**
     * Pan gesture handler for rotating the wheel through touch/drag
     */
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => {
                // Require significant movement to start handling the gesture
                return (
                    Math.abs(gestureState.dx) > 2 ||
                    Math.abs(gestureState.dy) > 2
                );
            },
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                // Continue handling the gesture during movement
                return (
                    Math.abs(gestureState.dx) > 2 ||
                    Math.abs(gestureState.dy) > 2
                );
            },
            onPanResponderGrant: (evt, gestureState) => {
                // Calculate initial touch vector from center when gesture starts
                const touchVectorX =
                    gestureState.x0 - circleCenterX - circleOffsetX;
                const touchVectorY =
                    gestureState.y0 - circleCenterY - circleOffsetY;

                // Only process touch if not too close to center (prevents erratic behavior)
                const distanceFromCenter = Math.sqrt(
                    touchVectorX * touchVectorX + touchVectorY * touchVectorY
                );
                if (distanceFromCenter > minTapDistanceFromCenter) {
                    // Calculate initial angle (in degrees) for reference
                    initialAngleRef.current =
                        Math.atan2(touchVectorY, touchVectorX) *
                        (180 / Math.PI);
                    lastAngleRef.current = initialAngleRef.current;

                    // Store current rotation to ensure continuity between gestures
                    initialRotationRef.current = rotateValueFinalRef.current;
                }
            },

            onPanResponderMove: (evt, gestureState) => {
                // Get current touch position
                const touchX = gestureState.moveX;
                const touchY = gestureState.moveY;

                // Calculate vector from center to current touch position
                const touchVectorX = touchX - circleCenterX - circleOffsetX;
                const touchVectorY = touchY - circleCenterY - circleOffsetY;

                // Skip processing if touch is too close to center
                const distanceFromCenter = Math.sqrt(
                    touchVectorX * touchVectorX + touchVectorY * touchVectorY
                );
                if (distanceFromCenter < minTapDistanceFromCenter) return;

                // Calculate current angle relative to center
                const currentAngle =
                    Math.atan2(touchVectorY, touchVectorX) * (180 / Math.PI);

                // Detect unrealistically large angle jumps that might indicate gesture issues
                if (lastAngleRef.current !== initialAngleRef.current) {
                    const absoluteAngleDiff = Math.abs(
                        currentAngle - lastAngleRef.current
                    );

                    // Skip updates with suspiciously large angle changes (filtering noise)
                    if (absoluteAngleDiff > 90 && absoluteAngleDiff < 270) {
                        return;
                    }
                }

                // Handle the -180°/+180° boundary crossing (when moving across the left side)
                const crossesBoundary =
                    (lastAngleRef.current > 150 && currentAngle < -150) ||
                    (lastAngleRef.current < -150 && currentAngle > 150);

                // Only update if angle change is significant or we're crossing the boundary
                const angleDiffFromLast = Math.abs(
                    currentAngle - lastAngleRef.current
                );
                if (
                    !crossesBoundary &&
                    angleDiffFromLast < minAngleChange &&
                    angleDiffFromLast !== 0
                ) {
                    return;
                }

                // Calculate how much the finger has rotated around the center
                let angleDiff = currentAngle - initialAngleRef.current;

                // Normalize angle to handle the -180/180 boundary
                if (angleDiff > 180) angleDiff -= 360;
                if (angleDiff < -180) angleDiff += 360;

                // Convert angle to rotation value (each position is 30° apart)
                const rotationChange = angleDiff / 30;

                // Calculate new rotation value
                const newValue = initialRotationRef.current + rotationChange;

                // Apply the rotation
                rotateAnim.setValue(newValue);
                rotateValueRef.current = newValue;

                // Update last angle for next move event
                lastAngleRef.current = currentAngle;
            },

            onPanResponderRelease: () => {
                // Record the time when pan ends
                lastPanReleaseTimeRef.current = Date.now();

                // Round to nearest position (0-11)
                const newIndex =
                    ((Math.round(rotateValueRef.current) % 12) + 12) % 12;

                // Update the weltanschauung index (12 - newIndex makes top = selected)
                const newWeltanschauungIndex = 12 - newIndex;

                console.log(1, 'index.tsx:316', {
                    rotateValue: rotateValueRef.current,
                    newIndex,
                    newWeltanschauungIndex,
                    weltanschauungIndex: weltanschauungIndexRef.current,
                });

                // Only update if the index has changed
                if (weltanschauungIndexRef.current !== newWeltanschauungIndex) {
                    setWeltanschauungIndex(newWeltanschauungIndex);
                    weltanschauungIndexRef.current = newWeltanschauungIndex;
                    console.log(1, 'index.tsx:327', {
                        weltanschauungIndex: weltanschauungIndexRef.current,
                    });
                }

                // Store final rotation value for continuity with next gesture
                rotateValueFinalRef.current = newIndex;

                // Snap animation to nearest position
                Animated.spring(rotateAnim, {
                    toValue: newIndex,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            ref={circleRef}
            style={[styles.circleContainer, animatedStyle]}
            {...panResponder.panHandlers}
        >
            <View style={styles.circleContent}>
                <Image style={styles.circleImage} />

                {allAutoren &&
                    allAutoren.map((autor, index) => {
                        // Limit to 12 positions around the wheel
                        if (index >= 12) return null;

                        // Position author images every 30° around the circle (starting at -90° so first is at top)
                        const angle = (index * 30 - 90) * (Math.PI / 180);
                        const isCurrentAutor = index === weltanschauungIndex;

                        // Adjust radius based on whether this is the selected author
                        const radius = isCurrentAutor
                            ? circleSize / 2 - autorImageRadiusLarge
                            : circleSize / 2 - autorImageRadius;

                        // Calculate x,y coordinates based on angle and radius
                        const x = radius * Math.cos(angle);
                        const y = radius * Math.sin(angle);

                        // Counter-rotate images to keep them oriented correctly as wheel turns
                        const rotationDegrees = index * 30;

                        // Get the appropriate author image
                        const imageKeys = Object.keys(AutorImages);
                        const imageKey = imageKeys[
                            index % imageKeys.length
                        ] as keyof typeof AutorImages;
                        const autorImage = AutorImages[imageKey];

                        // Calculate image size adjustments
                        const imageSize = isCurrentAutor
                            ? autorImageSizeLarge / 2
                            : autorImageSize / 2;

                        return (
                            <View
                                key={autor.id || index.toString()}
                                style={{
                                    position: 'absolute',
                                    left: circleCenterX + x - imageSize,
                                    top: circleCenterY + y - imageSize,
                                    zIndex: isCurrentAutor ? 10 : 1,
                                }}
                            >
                                <Pressable
                                    onPress={() => handleAutorPress(index)}
                                    style={({ pressed }) => ({
                                        opacity: pressed ? 0.7 : 1,
                                    })}
                                    hitSlop={-10}
                                >
                                    <Image
                                        source={autorImage}
                                        style={[
                                            isCurrentAutor
                                                ? styles.largeAutorImage
                                                : styles.autorImage,
                                            {
                                                transform: [
                                                    {
                                                        rotate: `${rotationDegrees}deg`,
                                                    },
                                                ],
                                            },
                                        ]}
                                    />
                                </Pressable>
                            </View>
                        );
                    })}
            </View>
        </Animated.View>
    );
}

/**
 * Generate component styles based on provided options and device theme
 */
const getStyles = (options: AuswahlradOptions) => {
    const colorScheme = useColorScheme();
    const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
    const { autorImageSize, autorImageSizeLarge, circleSize } = options;

    return StyleSheet.create({
        circleContainer: {
            width: circleSize,
            height: circleSize,
            alignItems: 'center',
            justifyContent: 'center',
        },
        circleContent: {
            width: circleSize,
            height: circleSize,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        circleImage: {
            width: circleSize,
            height: circleSize,
            resizeMode: 'contain',
        },
        autorImage: {
            width: autorImageSize,
            height: autorImageSize,
            borderRadius: autorImageSize / 2,
        },
        largeAutorImage: {
            width: autorImageSizeLarge,
            height: autorImageSizeLarge,
            borderRadius: autorImageSizeLarge / 2,
            borderWidth: 2,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.27,
            borderColor: Colors[theme].largeAutorImageBorderColor,
            shadowColor: Colors[theme].largeAutorImageShadowColor,
        },
    });
};
