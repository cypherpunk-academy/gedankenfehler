"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@trpc/server/adapters/express");
const appRouter_1 = require("./routers/appRouter");
const db_1 = require("./db");
const app = (0, express_1.default)();
// Configure CORS to accept all origins in development
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
}));
// Add express.json() middleware to parse JSON bodies
app.use(express_1.default.json());
// Serve static images
app.use('/static', express_1.default.static('src/static'));
// Create and mount tRPC middleware with explicit configuration
const server = (0, express_2.createExpressMiddleware)({
    router: appRouter_1.appRouter,
    createContext: () => ({}), // Add empty context
});
app.use('/trpc', server);
const PORT = process.env.SERVER_PORT || 5001;
app.listen(PORT, async () => {
    await (0, db_1.connectDB)();
    console.log(`Server is running on http://localhost:${PORT}`);
});
