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
import { BarChart } from 'react-native-chart-kit';
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

    const data = {
        labels: reactions.map(
            (reaction) =>
                reaction.type.charAt(0).toUpperCase() + reaction.type.slice(1)
        ),
        datasets: [
            {
                data: reactions.map((reaction) => reaction.count ?? 0),
                colors: reactions.map(
                    (reaction) =>
                        (opacity = 1) =>
                            reaction.color
                ),
            },
        ],
    };

    const chartConfig = {
        backgroundColor: 'transparent',
        backgroundGradientFrom: 'transparent',
        backgroundGradientTo: 'transparent',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16,
            backgroundColor: 'transparent',
        },
        propsForLabels: {
            dx: -0,
            fontSize: 8,
        },
        propsForBackgroundLines: {
            stroke: 'rgba(255,255,255,0.2)',
        },
        formatTopBarValue: (value: number) => `${value}`,
        fillShadowGradient: 'transparent',
        fillShadowGradientOpacity: 0,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
        strokeWidth: 0,
    };

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
                    <BarChart
                        data={data}
                        width={320}
                        height={200}
                        yAxisLabel=""
                        yAxisSuffix=""
                        segments={4}
                        chartConfig={chartConfig}
                        style={{
                            ...styles.chart,
                            backgroundColor: 'transparent',
                        }}
                        showValuesOnTopOfBars
                        fromZero
                        withCustomBarColorFromData={true}
                        flatColor={true}
                        withInnerLines={false}
                    />

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
    chart: {
        marginHorizontal: -16,
        marginLeft: 24,
        marginVertical: 8,
        borderRadius: 16,
        backgroundColor: 'transparent',
        zIndex: 0,
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
