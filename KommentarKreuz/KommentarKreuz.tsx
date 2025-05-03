import React, { useRef, useState } from 'react';
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

const WHEEL_RADIUS = 80;
const NO_DECISION_THRESHOLD = 60;
interface CommentWheelProps<Reaction> {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (direction: ReactionType) => void;
    reactions: Reaction[];
}

const KommentarKreuz: React.FC<CommentWheelProps<Reaction>> = ({
    isVisible,
    onClose,
    onSelect,
    reactions,
}) => {
    const [showStats, setShowStats] = useState(false);
    const pan = useRef(new Animated.ValueXY()).current;
    const selectionRef = useRef<string | null>(null);
    const angleAnim = useRef(new Animated.Value(-1)).current;

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
        if (absValue <= WHEEL_RADIUS / 2) {
            return value;
        }
        const excess = absValue - WHEEL_RADIUS / 2;
        return sign * (WHEEL_RADIUS / 2 + excess * 0.3); // Dämpfungsfaktor von 0.2 auf 0.1 reduziert
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
            const clampedX = getDampedValue(gesture.dx);
            const clampedY = getDampedValue(gesture.dy);

            pan.setValue({ x: clampedX, y: clampedY });

            if (
                Math.abs(clampedX) > NO_DECISION_THRESHOLD ||
                Math.abs(clampedY) > NO_DECISION_THRESHOLD
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
                (Math.abs(clampedX) > NO_DECISION_THRESHOLD ||
                    Math.abs(clampedY) > NO_DECISION_THRESHOLD)
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
                    <View style={styles.wheelContainer}>
                        <Animated.View
                            style={[
                                styles.wheel,
                                {
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
        width: 400,
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheel: {
        shadowColor: 'transparent',
        width: 400,
        height: 400,
        borderRadius: 200,
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
