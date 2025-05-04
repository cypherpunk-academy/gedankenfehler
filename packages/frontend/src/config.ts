declare const __DEV__: boolean;

export const BACKEND_URL = __DEV__
    ? 'https://lafisrap.ngrok.io' // Development - using your local IP
    : 'https://12weltanschauungenserver-production.up.railway.app'; // Production

export const CARD_STYLES = {
    default: 'defaultStyle',
    // Add more style variations here
} as const;
