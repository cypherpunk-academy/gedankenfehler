"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gedankeRouter = void 0;
const __1 = require("..");
const Gedanke_1 = __importDefault(require("../../models/Gedanke"));
const zod_1 = require("zod");
exports.gedankeRouter = (0, __1.router)({
    getAll: __1.publicProcedure.query(async () => {
        try {
            const gedanken = await Gedanke_1.default.find({}).sort({ rank: 1 });
            return gedanken;
        }
        catch (error) {
            throw new Error(`Failed to fetch Gedanken: ${error}`);
        }
    }),
    getByWeltanschauungAndNummer: __1.publicProcedure
        .input(zod_1.z.object({
        weltanschauung: zod_1.z.string(),
        nummer: zod_1.z.number(),
    }))
        .query(async ({ input }) => {
        console.log('Fetching Gedanken...');
        try {
            const gedanken = await Gedanke_1.default.find({
                weltanschauung: input.weltanschauung,
                nummer: input.nummer,
            }).sort({ rank: 1 });
            return gedanken;
        }
        catch (error) {
            throw new Error(`Failed to fetch Gedanken: ${error}`);
        }
    }),
});
