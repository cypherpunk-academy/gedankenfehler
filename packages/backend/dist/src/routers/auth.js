"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
const crypto_1 = require("crypto");
const Mensch_1 = __importDefault(require("../models/Mensch"));
exports.authRouter = (0, trpc_1.router)({
    login: trpc_1.publicProcedure
        .input(zod_1.z.object({
        deviceId: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        const { deviceId } = input;
        const now = new Date().toISOString();
        // Find or create Mensch
        let mensch = await Mensch_1.default.findOne({ deviceId });
        if (!mensch) {
            mensch = await Mensch_1.default.create({
                id: (0, crypto_1.randomUUID)(),
                deviceId,
                aktivSeit: now,
                letzterBesuch: now,
                anzahlBesuche: 1,
            });
        }
        else {
            // Update visit information
            await Mensch_1.default.updateOne({ deviceId }, {
                letzterBesuch: now,
                $inc: { anzahlBesuche: 1 },
            });
        }
        // Create new session
        const sessionId = (0, crypto_1.randomUUID)();
        const session = {
            id: sessionId,
            deviceId,
            menschId: mensch.id,
            lastActivity: new Date(),
        };
        trpc_1.sessions_store.set(sessionId, session);
        return {
            sessionId,
            menschId: mensch.id,
        };
    }),
});
