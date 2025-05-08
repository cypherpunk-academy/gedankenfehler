import React from 'react';
import {
    Modal,
    StyleSheet,
    View,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    Text,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Reaction } from '@/types';
interface BewertungsStatistikProps {
    isVisible: boolean;
    onClose: () => void;
    reactions: Reaction[];
}

const BewertungsStatistik: React.FC<BewertungsStatistikProps> = ({
    isVisible,
    onClose,
    reactions,
}) => {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = Math.min(screenWidth - 20, 400); // Maximum width of 400, with 20px padding on each side

    const barData = reactions.map((reaction) => ({
        value: reaction.count ?? 0,
        label: reaction.type.charAt(0).toUpperCase() + reaction.type.slice(1),
        frontColor: reaction.color,
        labelTextStyle: { color: 'white', fontSize: 8 },
        topLabelComponent: () => (
            <Text style={{ color: 'white', fontSize: 10, marginBottom: 4 }}>
                {reaction.count ?? 0}
            </Text>
        ),
    }));

    return (
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
                <View style={[styles.chartContainer, { width: chartWidth }]}>
                    <ImageBackground
                        source={require('@/assets/images/dialog-rectangle.png')}
                        style={styles.backgroundImage}
                        resizeMode="stretch"
                        imageStyle={{ backgroundColor: 'transparent' }}
                    />
                    <View style={styles.chartWrapper}>
                        <BarChart
                            data={barData}
                            width={320}
                            height={200}
                            barWidth={chartWidth / (reactions.length * 2)}
                            spacing={chartWidth / (reactions.length * 4)}
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: 'white' }}
                            noOfSections={4}
                            backgroundColor="transparent"
                            showFractionalValues={false}
                            hideYAxisText
                            barBorderRadius={4}
                            isAnimated
                        />
                    </View>

                    {/* Runner emoji in the lower left corner */}
                    {isVisible && (
                        <TouchableOpacity
                            style={styles.runnerContainer}
                            onPress={() => {
                                onClose();
                            }}
                        >
                            <Text style={styles.runnerEmoji}>🏃‍♂️</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartContainer: {
        borderRadius: 16,
        padding: 8,
        overflow: 'visible',
        backgroundColor: 'transparent',
        position: 'relative',
    },
    backgroundImage: {
        position: 'absolute',
        top: -35,
        left: 0,
        right: 0,
        bottom: -30,
        zIndex: 1,
        borderRadius: 16,
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        zIndex: 2,
    },
    runnerContainer: {
        position: 'absolute',
        bottom: 20,
        left: 40,
        zIndex: 10,
    },
    runnerEmoji: {
        fontSize: 30,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default BewertungsStatistik;
