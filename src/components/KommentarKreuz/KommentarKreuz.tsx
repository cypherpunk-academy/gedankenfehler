import React, { useRef, useState } from 'react';
import { useBewertungen } from '@/hooks/useBewertungen';
import {
    View,
    Modal,
    PanResponder,
    Animated,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import type { Reaction, ReactionType } from '@/types';
import BewertungsStatistik from './BewertungsStatistik';
import { KommentarKreuzProfile } from '@/utils/DeviceProfiles';

// Default values that will be overridden by device profile options if provided
const DEFAULT_WHEEL_RADIUS = 80;
const DEFAULT_NO_DECISION_THRESHOLD = 60;
const DEFAULT_CONTAINER_SIZE = 400;
const DEFAULT_CENTER_CIRCLE_SIZE = 100;

interface CommentWheelProps<Reaction> {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (direction: ReactionType) => void;
    reactions: Reaction[];
    options?: KommentarKreuzProfile;
}

const KommentarKreuz: React.FC<CommentWheelProps<Reaction>> = ({
    isVisible,
    onClose,
    onSelect,
    reactions,
    options,
}) => {
    const [showStats, setShowStats] = useState(false);
    const pan = useRef(new Animated.ValueXY()).current;
    const selectionRef = useRef<string | null>(null);
    const angleAnim = useRef(new Animated.Value(-1)).current;

    // Use options from device profile if provided, otherwise use defaults
    const containerSize = options?.containerSize || DEFAULT_CONTAINER_SIZE;
    const centerCircleSize =
        options?.centerCircleSize || DEFAULT_CENTER_CIRCLE_SIZE;
    const wheelRadius = options?.reactionDistance || DEFAULT_WHEEL_RADIUS;
    const noDecisionThreshold =
        centerCircleSize * 0.75 || DEFAULT_NO_DECISION_THRESHOLD;

    React.useEffect(() => {
        if (isVisible) {
            pan.setValue({ x: 0, y: 0 });
            selectionRef.current = null;
            angleAnim.setValue(-1);
        }
    }, [isVisible]);

    const getDampedValue = (value: number) => {
        const sign = Math.sign(value);
        const absValue = Math.abs(value);
        if (absValue <= wheelRadius / 2) {
            return value;
        }
        const excess = absValue - wheelRadius / 2;
        return sign * (wheelRadius / 2 + excess * 0.3); // Dämpfungsfaktor von 0.2 auf 0.1 reduziert
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
            const clampedX = getDampedValue(gesture.dx);
            const clampedY = getDampedValue(gesture.dy);

            pan.setValue({ x: clampedX, y: clampedY });

            if (
                Math.abs(clampedX) > noDecisionThreshold ||
                Math.abs(clampedY) > noDecisionThreshold
            ) {
                const angle = Math.atan2(gesture.dy, gesture.dx);
                const degrees = (angle * 180) / Math.PI;

                // Convert degrees to a value between 0 and 4 for animation
                let animValue = 0;
                if (degrees > -45 && degrees <= 45) animValue = 0;
                else if (degrees > 45 && degrees <= 135) animValue = 1;
                else if (degrees > 135 || degrees <= -135) animValue = 2;
                else animValue = 3;

                angleAnim.setValue(animValue);

                // Update selection ref for release handling
                let newSelection;
                if (animValue === 0) newSelection = reactions[1].type;
                else if (animValue === 1) newSelection = reactions[2].type;
                else if (animValue === 2) newSelection = reactions[3].type;
                else newSelection = reactions[4].type;

                selectionRef.current = newSelection;
            } else {
                selectionRef.current = null;
                angleAnim.setValue(-1); // Value for red color
            }
        },
        onPanResponderRelease: async (_, gesture) => {
            const clampedX = getDampedValue(gesture.dx);
            const clampedY = getDampedValue(gesture.dy);

            if (
                selectionRef.current &&
                (Math.abs(clampedX) > noDecisionThreshold ||
                    Math.abs(clampedY) > noDecisionThreshold)
            ) {
                onSelect(selectionRef.current as ReactionType);
                setShowStats(true);
                onClose();
            } else {
                // Only snap back if no selection was made or gesture was too small
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            }
            selectionRef.current = null;
        },
    });

    return (
        <View>
            <Modal
                transparent
                visible={isVisible}
                animationType="fade"
                onRequestClose={onClose}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View
                        style={[
                            styles.wheelContainer,
                            { width: containerSize, height: containerSize },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.wheel,
                                {
                                    width: containerSize,
                                    height: containerSize,
                                    borderRadius: containerSize / 2,
                                    transform: [
                                        { translateX: pan.x },
                                        { translateY: pan.y },
                                    ],
                                    borderColor: angleAnim.interpolate({
                                        inputRange: [-1, 0, 1, 2, 3],
                                        outputRange: [
                                            'transparent',
                                            ...reactions
                                                .slice(1)
                                                .map(
                                                    (reaction) => reaction.color
                                                ),
                                        ],
                                    }),
                                },
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.wheelContent}>
                                <Image
                                    source={require('../../assets/images/comment-wheel.png')}
                                    style={styles.wheelImage}
                                />
                            </View>
                        </Animated.View>
                    </View>
                </TouchableOpacity>
            </Modal>
            <BewertungsStatistik
                isVisible={showStats}
                onClose={() => setShowStats(false)}
                reactions={reactions}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheel: {
        shadowColor: 'transparent',
        elevation: 5,
        padding: 5,
        borderWidth: 10,
        position: 'relative',
    },
    wheelContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default KommentarKreuz;
