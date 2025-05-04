"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BewertungSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    bewertungs_typ: {
        type: String,
        required: true,
    },
    comment: { type: [String], required: false },
    gedankeId: { type: String, required: true },
    autorId: { type: String, required: true },
    nummer: { type: String, required: true },
    timestamp: { type: String, required: true },
    menschId: { type: String, required: true },
});
BewertungSchema.index({ gedankeId: 1, userId: 1 });
BewertungSchema.index({ gedankeId: 1 });
BewertungSchema.index({ autorId: 1 });
BewertungSchema.index({ menschId: 1 });
exports.default = mongoose_1.default.model('Bewertung', BewertungSchema, 'bewertungen');
