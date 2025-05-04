import {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import { trpc, setSessionId } from '../../packages/frontend/src/utils/trpc';

interface SessionContextType {
    menschId: string | null;
    isLoading: boolean;
    error: Error | null;
}

export const SessionContext = createContext<SessionContextType>({
    menschId: null,
    isLoading: false,
    error: null,
});

export const useSessionContext = () => useContext(SessionContext);

interface SessionProviderProps {
    children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
    const [menschId, setMenschId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const authenticateDevice = async () => {
            try {
                // Get or create device ID
                let deviceId = await SecureStore.getItemAsync('deviceId');
                if (!deviceId) {
                    deviceId = uuid.v4().toString();
                    await SecureStore.setItemAsync('deviceId', deviceId);
                }

                const { sessionId, menschId } = await trpc.auth.login.mutate({
                    deviceId,
                });
                setSessionId(sessionId);
                setMenschId(menschId);
                console.log('Device authenticated successfully');
            } catch (error) {
                console.error('Failed to authenticate device:', error);
                setError(
                    error instanceof Error
                        ? error
                        : new Error('Authentication failed')
                );
            } finally {
                setIsLoading(false);
            }
        };

        authenticateDevice();
    }, []);

    return (
        <SessionContext.Provider
            value={{
                menschId,
                isLoading,
                error,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}
