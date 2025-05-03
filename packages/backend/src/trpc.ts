import { initTRPC, TRPCError } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { randomUUID } from 'crypto';

// Session type definition
interface Session {
    id: string;
    deviceId: string;
    menschId: string;
    lastActivity: Date;
}

// Context type with session
interface Context {
    session?: Session;
}

// In-memory session storage (in production, use Redis or similar)
const sessions = new Map<string, Session>();

// Clean up expired sessions (15 minutes timeout)
setInterval(() => {
    const now = new Date();
    for (const [sessionId, session] of sessions.entries()) {
        if (now.getTime() - session.lastActivity.getTime() > 15 * 60 * 1000) {
            sessions.delete(sessionId);
        }
    }
}, 60 * 1000); // Check every minute

// Context creator
export const createContext = ({
    req,
    res,
}: CreateExpressContextOptions): Context => {
    const sessionId = req.headers['x-session-id'] as string;
    const session = sessions.get(sessionId);

    if (session) {
        // Update last activity
        session.lastActivity = new Date();
        sessions.set(sessionId, session);
    }

    return { session };
};

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        });
    }
    return next({
        ctx: {
            session: ctx.session,
        },
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const sessions_store = sessions; // Export for use in auth router
