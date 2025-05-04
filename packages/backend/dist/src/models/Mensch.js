"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MenschSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: false },
    deviceId: { type: String, required: false },
    aktivSeit: { type: String, required: false },
    letzterBesuch: { type: String, required: false },
    anzahlBesuche: { type: Number, required: false },
});
MenschSchema.index({ email: 1 });
exports.default = mongoose_1.default.model('Mensch', MenschSchema, 'menschen');
