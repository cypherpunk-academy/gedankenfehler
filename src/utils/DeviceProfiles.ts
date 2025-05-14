import { Dimensions, Platform, ScaledSize } from 'react-native';
import React from 'react';

// Device type detection
export type DeviceType =
    | 'smartphone'
    | 'tablet'
    | 'webSmall'
    | 'webMedium'
    | 'webLarge';

// Default fallback size for SSR or when dimensions are not available
const DEFAULT_WEB_DEVICE_TYPE: DeviceType = 'webMedium';

// Safely check if window exists
const isClient = typeof window !== 'undefined';

export function getDeviceType(): DeviceType {
    try {
        // Use the useWindowDimensions hook from React Native for runtime
        // This is just for initial/SSR detection - the hook will provide live updates
        const dimensions = Dimensions.get('window');
        const width = dimensions.width;
        const isWeb = Platform.OS === 'web';

        console.log(1, 'DeviceProfiles.ts:37', { dimensions, isWeb });

        console.log('DeviceProfiles getDeviceType:', {
            width,
            platform: Platform.OS,
            isWeb,
        });

        // For native platforms
        if (!isWeb) {
            const smallerDimension = Math.min(
                dimensions.width,
                dimensions.height
            );
            return smallerDimension < 600 ? 'smartphone' : 'tablet';
        }

        console.log(1, 'DeviceProfiles.ts:54', { width });

        // For web - if we have a valid width
        if (width && width > 0) {
            if (width < 768) return 'webSmall';
            if (width < 1200) return 'webMedium';
            return 'webLarge';
        }

        // Fallback for SSR or when dimensions aren't available
        return DEFAULT_WEB_DEVICE_TYPE;
    } catch (error) {
        console.error('Error in getDeviceType:', error);
        return DEFAULT_WEB_DEVICE_TYPE;
    }
}

// Device profile for AuswahlRad component
export interface AuswahlRadProfile {
    circleSize: number;
    circleOffsetX: number;
    circleOffsetY: number;
    minTapDistanceFromCenter: number;
    autorImageSize: number;
    autorImageSizeLarge: number;
    autorImageRadius: number;
    autorImageRadiusLarge: number;
}

// Device profile for KommentarKreuz component
export interface KommentarKreuzProfile {
    containerSize: number;
    centerCircleSize: number;
    reactionDistance: number;
    reactionCircleSize: number;
}

// Device profile for ScrollAuswahl component
export interface ScrollAuswahlProfile {
    itemHeight: number;
    visibleItems: number;
    fontSize: number;
}

// Combined profiles for each screen
export interface ScreenProfiles {
    container?: {
        flexDirection: 'column' | 'row';
        marginTop: number;
        titleHeight: number;
    };
    titleTextGedankenfehler?: { fontSize: number };
    auswahlRad: AuswahlRadProfile;
    kommentarKreuz?: KommentarKreuzProfile;
    scrollAuswahl?: ScrollAuswahlProfile;
    canvasViewContainer?: {
        width: number;
        height: number;
        marginTop: number;
        marginLeft: number;
    };
}

// AufloesungScreen profiles
export const aufloesungScreenProfiles: Record<DeviceType, ScreenProfiles> = {
    smartphone: {
        auswahlRad: {
            circleSize: 600,
            circleOffsetX: -80,
            circleOffsetY: 550,
            minTapDistanceFromCenter: 20,
            autorImageSize: 100,
            autorImageSizeLarge: 120,
            autorImageRadius: 40,
            autorImageRadiusLarge: 40,
        },
        kommentarKreuz: {
            containerSize: 280,
            centerCircleSize: 80,
            reactionDistance: 90,
            reactionCircleSize: 60,
        },
    },
    tablet: {
        auswahlRad: {
            circleSize: 800,
            circleOffsetX: -80,
            circleOffsetY: 680,
            minTapDistanceFromCenter: 20,
            autorImageSize: 150,
            autorImageSizeLarge: 170,
            autorImageRadius: 60,
            autorImageRadiusLarge: 60,
        },
        kommentarKreuz: {
            containerSize: 350,
            centerCircleSize: 100,
            reactionDistance: 110,
            reactionCircleSize: 70,
        },
    },
    webSmall: {
        auswahlRad: {
            circleSize: 800,
            circleOffsetX: -80,
            circleOffsetY: 650,
            minTapDistanceFromCenter: 20,
            autorImageSize: 150,
            autorImageSizeLarge: 180,
            autorImageRadius: 60,
            autorImageRadiusLarge: 60,
        },
        kommentarKreuz: {
            containerSize: 350,
            centerCircleSize: 100,
            reactionDistance: 110,
            reactionCircleSize: 70,
        },
    },
    webMedium: {
        auswahlRad: {
            circleSize: 850,
            circleOffsetX: -80,
            circleOffsetY: 680,
            minTapDistanceFromCenter: 20,
            autorImageSize: 160,
            autorImageSizeLarge: 190,
            autorImageRadius: 65,
            autorImageRadiusLarge: 65,
        },
        kommentarKreuz: {
            containerSize: 380,
            centerCircleSize: 110,
            reactionDistance: 120,
            reactionCircleSize: 75,
        },
    },
    webLarge: {
        auswahlRad: {
            circleSize: 900,
            circleOffsetX: -80,
            circleOffsetY: 700,
            minTapDistanceFromCenter: 20,
            autorImageSize: 170,
            autorImageSizeLarge: 200,
            autorImageRadius: 70,
            autorImageRadiusLarge: 70,
        },
        kommentarKreuz: {
            containerSize: 400,
            centerCircleSize: 120,
            reactionDistance: 130,
            reactionCircleSize: 80,
        },
    },
};

// EinfuehrungScreen profiles
export const einfuehrungScreenProfiles: Record<DeviceType, ScreenProfiles> = {
    smartphone: {
        auswahlRad: {
            circleSize: 500,
            circleOffsetX: -60,
            circleOffsetY: 500,
            minTapDistanceFromCenter: 20,
            autorImageSize: 100,
            autorImageSizeLarge: 120,
            autorImageRadius: 40,
            autorImageRadiusLarge: 40,
        },
    },
    tablet: {
        auswahlRad: {
            circleSize: 700,
            circleOffsetX: -60,
            circleOffsetY: 600,
            minTapDistanceFromCenter: 20,
            autorImageSize: 130,
            autorImageSizeLarge: 160,
            autorImageRadius: 50,
            autorImageRadiusLarge: 50,
        },
    },
    webSmall: {
        auswahlRad: {
            circleSize: 700,
            circleOffsetX: -60,
            circleOffsetY: 600,
            minTapDistanceFromCenter: 20,
            autorImageSize: 130,
            autorImageSizeLarge: 160,
            autorImageRadius: 50,
            autorImageRadiusLarge: 50,
        },
    },
    webMedium: {
        auswahlRad: {
            circleSize: 750,
            circleOffsetX: -60,
            circleOffsetY: 630,
            minTapDistanceFromCenter: 20,
            autorImageSize: 140,
            autorImageSizeLarge: 170,
            autorImageRadius: 55,
            autorImageRadiusLarge: 55,
        },
    },
    webLarge: {
        auswahlRad: {
            circleSize: 800,
            circleOffsetX: -60,
            circleOffsetY: 650,
            minTapDistanceFromCenter: 20,
            autorImageSize: 150,
            autorImageSizeLarge: 180,
            autorImageRadius: 60,
            autorImageRadiusLarge: 60,
        },
    },
};

// Hook to listen for dimension changes
export function useDeviceProfile<T extends Record<DeviceType, ScreenProfiles>>(
    profiles: T
): ScreenProfiles {
    // Start with default device type
    const [deviceType, setDeviceType] = React.useState<DeviceType>(
        DEFAULT_WEB_DEVICE_TYPE
    );

    React.useEffect(() => {
        // Set initial device type
        const initialDeviceType = getDeviceType();
        setDeviceType(initialDeviceType);

        // Function to update device type based on dimensions
        const updateDeviceType = () => {
            const newType = getDeviceType();
            setDeviceType(newType);
        };

        // Listen for dimension changes
        const subscription = Dimensions.addEventListener(
            'change',
            updateDeviceType
        );

        // For web only: add a listener that runs after first render
        // This helps in case the Dimensions API wasn't fully initialized during initial render
        if (Platform.OS === 'web') {
            // Use a short timeout to ensure we get valid dimensions
            const timeoutId = setTimeout(updateDeviceType, 100);
            return () => {
                clearTimeout(timeoutId);
                subscription.remove();
            };
        }

        return () => {
            subscription.remove();
        };
    }, []);

    return profiles[deviceType];
}
