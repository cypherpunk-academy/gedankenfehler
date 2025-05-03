import {
    createContext,
    useContext,
    ReactNode,
    useEffect,
    useState,
} from 'react';
import type { Gedanke } from '@/packages/backend/src/models/Gedanke';
import type { Autor } from '@/packages/backend/src/models/Autor';
import { useGedanken } from '@/hooks/useGedanken';
import { useAutoren } from '@/hooks/useAutoren';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DatabaseContextType {
    gedanken: Gedanke[] | null;
    autoren: Autor[] | null;
    isLoadingGedanken: boolean;
    isLoadingAutoren: boolean;
    errorGedanken: Error | null;
    errorAutoren: Error | null;
    weltanschauungIndex: number;
    setWeltanschauungIndex: (index: number) => void;
    nummer: number;
    setNummer: (nummer: number) => void;
}

const initialWeltanschauungIndex = 0;
const initialGedankenNummer = 1;

export const DatabaseContext = createContext<DatabaseContextType>({
    gedanken: null,
    autoren: null,
    isLoadingGedanken: false,
    isLoadingAutoren: false,
    errorGedanken: null,
    errorAutoren: null,
    weltanschauungIndex: initialWeltanschauungIndex,
    setWeltanschauungIndex: (index: number) => {},
    nummer: initialGedankenNummer,
    setNummer: (nummer: number) => {},
});

export const useDatabaseContext = () => useContext(DatabaseContext);

interface DatabaseProviderProps {
    children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
    const [nummer, setNummer] = useState<number>(initialGedankenNummer);
    const [weltanschauungIndex, setWeltanschauungIndex] = useState(
        initialWeltanschauungIndex
    );

    const {
        data: gedanken,
        isLoading: isLoadingGedanken,
        error: errorGedanken,
    } = useGedanken();

    const {
        data: autoren,
        isLoading: isLoadingAutoren,
        error: errorAutoren,
    } = useAutoren();

    // Load saved values from AsyncStorage on mount
    useEffect(() => {
        const loadSavedValues = async () => {
            try {
                const [savedIndex, savedNummer] = await Promise.all([
                    AsyncStorage.getItem('weltanschauungIndex'),
                    AsyncStorage.getItem('nummer'),
                ]);

                if (savedIndex !== null) {
                    setWeltanschauungIndex(parseInt(savedIndex, 10));
                }
                if (savedNummer !== null) {
                    setNummer(parseInt(savedNummer, 10));
                }
            } catch (error) {
                console.error('Error loading saved values:', error);
            }
        };

        loadSavedValues();
    }, []);

    // Save values whenever they change
    useEffect(() => {
        const saveValues = async () => {
            try {
                await Promise.all([
                    AsyncStorage.setItem(
                        'weltanschauungIndex',
                        String(weltanschauungIndex)
                    ),
                    AsyncStorage.setItem('nummer', String(nummer)),
                ]);
            } catch (error) {
                console.error('Error saving values:', error);
            }
        };

        saveValues();
    }, [weltanschauungIndex, nummer]);

    return (
        <DatabaseContext.Provider
            value={{
                gedanken,
                autoren,
                isLoadingGedanken,
                isLoadingAutoren,
                errorGedanken,
                errorAutoren,
                weltanschauungIndex,
                setWeltanschauungIndex,
                nummer,
                setNummer,
            }}
        >
            {children}
        </DatabaseContext.Provider>
    );
}
