"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AutorSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    geborenAm: { type: String, required: false },
    geborenIn: { type: String, required: false },
    gestorbenAm: { type: String, required: false },
    gestorbenIn: { type: String, required: false },
    bild: { type: String, required: false },
    beschreibung: { type: String, required: false },
});
AutorSchema.index({ name: 1 });
exports.default = mongoose_1.default.model('Autor', AutorSchema, 'autoren');
