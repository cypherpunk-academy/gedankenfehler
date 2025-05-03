import { router } from '..';
import { gedankeRouter } from './gedanke';
import { autorRouter } from './autor';
import { bewertungRouter } from './bewertung';
import { authRouter } from '../auth';

// Move the router initialization after exporting the base utilities
export const appRouter = router({
    gedanke: gedankeRouter,
    autor: autorRouter,
    bewertung: bewertungRouter,
    auth: authRouter,
});

export type AppRouter = typeof appRouter;
