import { publicProcedure, router } from '..';
import { z } from 'zod';
import Bewertung, {
    type Bewertung as BewertungType,
} from '../../models/Bewertung';

export const bewertungRouter = router({
    getByGedankeId: publicProcedure
        .input(
            z.object({
                gedankeId: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                const bewertungen = await Bewertung.find({
                    gedankeId: input.gedankeId,
                }).sort({ timestamp: -1 });
                return bewertungen as BewertungType[];
            } catch (error) {
                throw new Error(`Failed to fetch Bewertungen: ${error}`);
            }
        }),

    upsert: publicProcedure
        .input(
            z.object({
                id: z.string(),
                bewertungs_typ: z.enum([
                    'interesse',
                    'zustimmung',
                    'wut',
                    'ablehnung',
                    'inspiration',
                ]),
                comment: z.array(z.string()).optional(),
                gedankeId: z.string(),
                autorId: z.string(),
                nummer: z.string(),
                timestamp: z.string(),
                menschId: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const filter = {
                    menschId: input.menschId,
                    gedankeId: input.gedankeId,
                };

                const update = { $set: input };
                const options = { upsert: true, new: true };

                const bewertung = await Bewertung.findOneAndUpdate(
                    filter,
                    update,
                    options
                );

                return bewertung as BewertungType;
            } catch (error) {
                throw new Error(`Failed to upsert Bewertung: ${error}`);
            }
        }),
});
