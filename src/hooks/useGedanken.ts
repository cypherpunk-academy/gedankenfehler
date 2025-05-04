import { useQuery } from '@tanstack/react-query';
import { trpc } from '../../packages/frontend/src/utils/trpc';
import type { Gedanke } from '../../packages/backend/src/models/Gedanke';

export function useGedanken(weltanschauung?: string, nummer?: number) {
    // Check if either both parameters are set or none are set
    const bothSet = weltanschauung && nummer;
    const noneSet = !weltanschauung && !nummer;

    if (!bothSet && !noneSet) {
        throw new Error(
            'Either provide both weltanschauung and nummer, or neither'
        );
    }

    const queryKey = noneSet
        ? ['gedanken']
        : ['gedanken', weltanschauung, nummer];
    const queryFn = async () => {
        const result = noneSet
            ? await trpc.gedanke.getAll.query()
            : await trpc.gedanke.getByWeltanschauungAndNummer.query({
                  weltanschauung: weltanschauung as string,
                  nummer: nummer as number,
              });
        return Array.isArray(result) ? result : [result];
    };

    const { data, isLoading, error } = useQuery<Gedanke[], Error>({
        queryKey,
        queryFn,
        retry: 2,
        staleTime: 1 * 10 * 1000, // Consider data stale after 5 minutes
    });

    return { data: data ?? null, isLoading, error };
}
