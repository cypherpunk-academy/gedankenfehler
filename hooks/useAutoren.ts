import { Autor } from '@/packages/backend/src/models/Autor';
import { trpc } from '@/packages/frontend/src/utils/trpc';
import { useQuery } from '@tanstack/react-query';

export function useAutoren(autorIds?: string[]) {
    const queryKey = autorIds?.length ? ['autoren', autorIds] : ['autoren'];
    const queryFn = async () => {
        const results = autorIds?.length
            ? await trpc.autor.getByIds.query({ ids: autorIds })
            : await trpc.autor.getAll.query();
        return results;
    };

    const { data, isLoading, error } = useQuery<Autor[], Error>({
        queryKey,
        queryFn,
        retry: 2,
        staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    });

    return { data: data ?? null, isLoading, error };
}
