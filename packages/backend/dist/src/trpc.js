"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessions_store = exports.protectedProcedure = exports.publicProcedure = exports.router = exports.createContext = void 0;
const server_1 = require("@trpc/server");
// In-memory session storage (in production, use Redis or similar)
const sessions = new Map();
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
const createContext = ({ req, res, }) => {
    const sessionId = req.headers['x-session-id'];
    const session = sessions.get(sessionId);
    if (session) {
        // Update last activity
        session.lastActivity = new Date();
        sessions.set(sessionId, session);
    }
    return { session };
};
exports.createContext = createContext;
// Initialize tRPC with context
const t = server_1.initTRPC.context().create();
// Middleware to check if user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
    if (!ctx.session) {
        throw new server_1.TRPCError({
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
exports.router = t.router;
exports.publicProcedure = t.procedure;
exports.protectedProcedure = t.procedure.use(isAuthed);
exports.sessions_store = sessions; // Export for use in auth router
