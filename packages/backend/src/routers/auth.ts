import { z } from 'zod';
import { router, publicProcedure, sessions_store } from '../trpc';
import { randomUUID } from 'crypto';
import MenschModel from '../models/Mensch';

export const authRouter = router({
    login: publicProcedure
        .input(
            z.object({
                deviceId: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { deviceId } = input;
            const now = new Date().toISOString();

            // Find or create Mensch
            let mensch = await MenschModel.findOne({ deviceId });

            if (!mensch) {
                mensch = await MenschModel.create({
                    id: randomUUID(),
                    deviceId,
                    aktivSeit: now,
                    letzterBesuch: now,
                    anzahlBesuche: 1,
                });
            } else {
                // Update visit information
                await MenschModel.updateOne(
                    { deviceId },
                    {
                        letzterBesuch: now,
                        $inc: { anzahlBesuche: 1 },
                    }
                );
            }

            // Create new session
            const sessionId = randomUUID();
            const session = {
                id: sessionId,
                deviceId,
                menschId: mensch.id,
                lastActivity: new Date(),
            };

            sessions_store.set(sessionId, session);

            return {
                sessionId,
                menschId: mensch.id,
            };
        }),
});
