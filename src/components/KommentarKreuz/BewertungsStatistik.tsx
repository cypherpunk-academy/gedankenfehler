import React from 'react';
import {
    Modal,
    StyleSheet,
    View,
    TouchableOpacity,
    Dimensions,
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
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    style={[styles.chartContainer, { width: chartWidth }]}
                >
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
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
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
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        backgroundColor: 'rgba(0, 0,0, 0.7)',
        borderRadius: 16,
        width: '95%',
        marginLeft: '2.5%',
        zIndex: 1,
        padding: 5,
    },
    closeButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    // Keeping the following for backward compatibility
    backgroundImage: {
        position: 'absolute',
        top: -35,
        left: 0,
        right: 0,
        bottom: -30,
        zIndex: 2,
        borderRadius: 16,
    },
    runnerContainer: {
        position: 'absolute',
        bottom: 20,
        left: 15,
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
