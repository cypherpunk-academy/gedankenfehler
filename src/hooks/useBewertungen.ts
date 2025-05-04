import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../../packages/frontend/src/utils/trpc';
import type { Bewertung } from '../../packages/backend/src/models/Bewertung';
import { ReactionType } from '../types';
import { useMemo } from 'react';

interface CreateBewertungInput<T extends ReactionType> {
    id: string;
    bewertungs_typ: T;
    comment?: string[];
    gedankeId: string;
    autorId: string;
    nummer: string;
    menschId: string;
}

type BewertungsAggregation = Record<ReactionType, number>;

export function useBewertungen<T extends ReactionType>(gedankeId: string) {
    const queryClient = useQueryClient();

    // Query for fetching and aggregating bewertungen
    const {
        data: bewertungen,
        isLoading,
        error,
    } = useQuery<Bewertung[], Error>({
        queryKey: ['bewertungen', gedankeId],
        queryFn: async () => {
            // Skip API call if gedankeId is empty
            const result = await trpc.bewertung.getByGedankeId.query({
                gedankeId,
            });
            return result;
        },
        retry: 2,
        staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
        // Disable the query when gedankeId is empty
        enabled: !!gedankeId,
    });

    // Memoize the aggregated bewertungen to prevent unnecessary re-renders
    const aggregierteBewertungen = useMemo(() => {
        const result: BewertungsAggregation = {
            interesse: 0,
            zustimmung: 0,
            wut: 0,
            ablehnung: 0,
            inspiration: 0,
        };

        if (bewertungen) {
            bewertungen.forEach((bewertung) => {
                const bewertungsTyp = bewertung.bewertungs_typ as ReactionType;
                result[bewertungsTyp]++;
            });
        }

        return result;
    }, [bewertungen]);

    const mutation = useMutation({
        mutationFn: async (input: CreateBewertungInput<T>) => {
            // Skip API call if gedankeId is empty
            if (!gedankeId) {
                throw new Error(
                    'Cannot set bewertung without a valid gedankeId'
                );
            }
            return await trpc.bewertung.upsert.mutate({
                ...input,
                timestamp: new Date().toISOString(),
            });
        },
        onSuccess: () => {
            // Invalidate and refetch the bewertungen query when mutation is successful
            if (gedankeId) {
                queryClient.invalidateQueries({
                    queryKey: ['bewertungen', gedankeId],
                });
            }
        },
    });

    return {
        aggregierteBewertungen,
        isLoading,
        error,
        setBewertung: mutation.mutate,
        isMutating: mutation.isPending,
        mutationError: mutation.error,
    };
}
