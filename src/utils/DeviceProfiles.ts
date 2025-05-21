import { Dimensions, DimensionValue, Platform, ScaledSize } from "react-native";
import React from "react";

// Device type detection
export type DeviceType =
  | "smartphone"
  | "tablet"
  | "webSmall"
  | "webMedium"
  | "webLarge";

// Default fallback size for SSR or when dimensions are not available
const DEFAULT_WEB_DEVICE_TYPE: DeviceType = "webMedium";

export function getDeviceType(): DeviceType {
  try {
    // Use the useWindowDimensions hook from React Native for runtime
    // This is just for initial/SSR detection - the hook will provide live updates
    const dimensions = Dimensions.get("window");
    const width = dimensions.width;
    const isWeb = Platform.OS === "web";

    // For native platforms
    if (!isWeb) {
      const smallerDimension = Math.min(dimensions.width, dimensions.height);
      return smallerDimension < 600 ? "smartphone" : "tablet";
    }

    // For web - if we have a valid width
    if (width && width > 0) {
      if (width < 768) return "webSmall";
      if (width < 1200) return "webMedium";
      return "webLarge";
    }

    // Fallback for SSR or when dimensions aren't available
    return DEFAULT_WEB_DEVICE_TYPE;
  } catch (error) {
    console.error("Error in getDeviceType:", error);
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
export interface GedankenfehlerScreenProfile {
  container?: {
    flexDirection: "column" | "row";
    marginTop?: number;
    titleHeight?: number;
    padding?: number;
  };
  gedankenfehlerContainer?: {
    paddingRight: number;
  };
  titleTextWeltanschauungen?: {
    marginTop?: number;
    fontSize?: number;
  };
  auswahlRad: AuswahlRadProfile;
  kommentarKreuz?: KommentarKreuzProfile;
  scrollAuswahl?: ScrollAuswahlProfile;
  canvasViewContainer?: {
    width?: number;
    height?: number;
    marginTop?: number;
    marginLeft?: number;
  };
  deviceType?: DeviceType;
  canvasGedanke?: {
    fontSize: number;
    marginHorizontal?: DimensionValue;
    marginVertical?: DimensionValue;
  };
  canvasWeltanschauungTitle?: {
    fontSize?: number;
  };
  canvasGedankeKurzLabel?: {
    fontSize?: number;
  };
  canvasGedankeKurz?: {
    fontSize?: number;
    marginHorizontal?: DimensionValue;
    marginVertical?: DimensionValue;
  };
}

// AufloesungsScreen profiles
export interface AufloesungsScreenProfile {
  containerTop: number;
  auswahlRad: AuswahlRadProfile;
  kommentarKreuz: KommentarKreuzProfile;
  textContainer?: {
    height: DimensionValue;
    marginTop: number;
    padding: number;
    marginRight?: DimensionValue;
    marginLeft?: DimensionValue;
  };
  gedankenfehler?: {
    fontSize: number;
  };
  gedanke?: {
    fontSize: number;
  };
  commentContainer?: {
    height: DimensionValue;
    width: DimensionValue;
    borderRadius: number;
    bottom: number;
    left: number;
  };
  canvasViewContainer?: {
    marginTop: number;
  };
  canvasWeltanschauungTitle?: {
    fontSize: number;
  };
  canvasGedankeKurzLabel?: {
    fontSize: number;
  };
  canvasGedankeKurz?: {
    fontSize: number;
    marginHorizontal?: string;
    marginVertical?: number;
  };
  canvasGedanke?: {
    fontSize: number;
    marginVertical?: number;
  };
}

// EinfuehrungScreen profiles
export const einfuehrungScreenProfiles: Record<
  DeviceType,
  { auswahlRad: AuswahlRadProfile }
> = {
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
export function useDeviceProfile<T>(
  profiles: Record<DeviceType, T>,
): T & { deviceType: DeviceType } {
  // Start with default device type
  const [deviceType, setDeviceType] = React.useState<DeviceType>(
    DEFAULT_WEB_DEVICE_TYPE,
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
      "change",
      updateDeviceType,
    );

    // For web only: add a listener that runs after first render
    // This helps in case the Dimensions API wasn't fully initialized during initial render
    if (Platform.OS === "web") {
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

  return { ...profiles[deviceType], deviceType };
}
