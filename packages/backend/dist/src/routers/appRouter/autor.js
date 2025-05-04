"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autorRouter = void 0;
const __1 = require("..");
const Autor_1 = __importDefault(require("../../models/Autor"));
const zod_1 = require("zod");
exports.autorRouter = (0, __1.router)({
    getAll: __1.publicProcedure.query(async () => {
        try {
            const autors = await Autor_1.default.find({});
            return autors;
        }
        catch (error) {
            throw new Error(`Failed to fetch all Autors: ${error}`);
        }
    }),
    getById: __1.publicProcedure
        .input(zod_1.z.object({
        id: zod_1.z.string(),
    }))
        .query(async ({ input }) => {
        try {
            const autor = await Autor_1.default.findOne({ id: input.id });
            return autor;
        }
        catch (error) {
            throw new Error(`Failed to fetch Autor: ${error}`);
        }
    }),
    getByIds: __1.publicProcedure
        .input(zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string()),
    }))
        .query(async ({ input }) => {
        try {
            const autors = await Autor_1.default.find({ id: { $in: input.ids } });
            return autors;
        }
        catch (error) {
            throw new Error(`Failed to fetch Autors: ${error}`);
        }
    }),
});
