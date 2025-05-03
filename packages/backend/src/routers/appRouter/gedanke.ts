import { publicProcedure, router } from '..';
import Gedanke, { type Gedanke as GedankeType } from '../../models/Gedanke';
import { z } from 'zod';

export const gedankeRouter = router({
    getAll: publicProcedure.query(async () => {
        try {
            const gedanken = await Gedanke.find({}).sort({ rank: 1 });
            return gedanken as GedankeType[];
        } catch (error) {
            throw new Error(`Failed to fetch Gedanken: ${error}`);
        }
    }),

    getByWeltanschauungAndNummer: publicProcedure
        .input(
            z.object({
                weltanschauung: z.string(),
                nummer: z.number(),
            })
        )
        .query(async ({ input }): Promise<GedankeType[]> => {
            console.log('Fetching Gedanken...');
            try {
                const gedanken = await Gedanke.find({
                    weltanschauung: input.weltanschauung,
                    nummer: input.nummer,
                }).sort({ rank: 1 });

                return gedanken as GedankeType[];
            } catch (error) {
                throw new Error(`Failed to fetch Gedanken: ${error}`);
            }
        }),
});
