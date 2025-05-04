"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bewertungRouter = void 0;
const __1 = require("..");
const zod_1 = require("zod");
const Bewertung_1 = __importDefault(require("../../models/Bewertung"));
exports.bewertungRouter = (0, __1.router)({
    getByGedankeId: __1.publicProcedure
        .input(zod_1.z.object({
        gedankeId: zod_1.z.string(),
    }))
        .query(async ({ input }) => {
        try {
            const bewertungen = await Bewertung_1.default.find({
                gedankeId: input.gedankeId,
            }).sort({ timestamp: -1 });
            return bewertungen;
        }
        catch (error) {
            throw new Error(`Failed to fetch Bewertungen: ${error}`);
        }
    }),
    upsert: __1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        bewertungs_typ: zod_1.z.enum([
            'interesse',
            'zustimmung',
            'wut',
            'ablehnung',
            'inspiration',
        ]),
        comment: zod_1.z.array(zod_1.z.string()).optional(),
        gedankeId: zod_1.z.string(),
        autorId: zod_1.z.string(),
        nummer: zod_1.z.string(),
        timestamp: zod_1.z.string(),
        menschId: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        try {
            const filter = {
                menschId: input.menschId,
                gedankeId: input.gedankeId,
            };
            const update = { $set: input };
            const options = { upsert: true, new: true };
            const bewertung = await Bewertung_1.default.findOneAndUpdate(filter, update, options);
            return bewertung;
        }
        catch (error) {
            throw new Error(`Failed to upsert Bewertung: ${error}`);
        }
    }),
});
