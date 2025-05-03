import { InferSchemaType } from 'mongoose';
import mongoose from 'mongoose';

const BewertungSchema = new mongoose.Schema({
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

export type Bewertung = InferSchemaType<typeof BewertungSchema>;
export default mongoose.model('Bewertung', BewertungSchema, 'bewertungen');
