import { publicProcedure, router } from '..';
import Autor, { type Autor as AutorType } from '../../models/Autor';
import { z } from 'zod';

export const autorRouter = router({
    getAll: publicProcedure.query(async (): Promise<AutorType[]> => {
        try {
            const autors = await Autor.find({});
            return autors;
        } catch (error) {
            throw new Error(`Failed to fetch all Autors: ${error}`);
        }
    }),
    getById: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input }): Promise<AutorType | null> => {
            try {
                const autor = await Autor.findOne({ id: input.id });
                return autor;
            } catch (error) {
                throw new Error(`Failed to fetch Autor: ${error}`);
            }
        }),

    getByIds: publicProcedure
        .input(
            z.object({
                ids: z.array(z.string()),
            })
        )
        .query(async ({ input }): Promise<AutorType[]> => {
            try {
                const autors = await Autor.find({ id: { $in: input.ids } });
                return autors;
            } catch (error) {
                throw new Error(`Failed to fetch Autors: ${error}`);
            }
        }),
});
