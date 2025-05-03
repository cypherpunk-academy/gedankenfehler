import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { BACKEND_URL } from '../config';
import type { AppRouter } from '../../../backend/src/routers/appRouter';

// Session management
let sessionId: string | null = null;

export const setSessionId = (newSessionId: string) => {
    sessionId = newSessionId;
};

export const getSessionId = () => sessionId;

export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `${BACKEND_URL}/trpc`,
            headers: () => ({
                'Content-Type': 'application/json',
                ...(sessionId ? { 'x-session-id': sessionId } : {}),
            }),
        }),
    ],
});
