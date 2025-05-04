import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers/appRouter';
import { connectDB } from './db';

const app = express();

// Configure CORS to accept all origins in development
app.use(
    cors({
        origin: '*',
        methods: ['POST', 'GET', 'OPTIONS'],
        credentials: true,
    })
);

// Add express.json() middleware to parse JSON bodies
app.use(express.json());

// Serve static images
app.use('/static', express.static('src/static'));

// Create and mount tRPC middleware with explicit configuration
const server = createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}), // Add empty context
});

app.use('/trpc', server);

const PORT = process.env.SERVER_PORT || 5001;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
