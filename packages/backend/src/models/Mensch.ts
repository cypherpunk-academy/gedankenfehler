import { InferSchemaType } from 'mongoose';
import mongoose from 'mongoose';

const MenschSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: false },
    deviceId: { type: String, required: false },
    aktivSeit: { type: String, required: false },
    letzterBesuch: { type: String, required: false },
    anzahlBesuche: { type: Number, required: false },
});

MenschSchema.index({ email: 1 });

export type Mensch = InferSchemaType<typeof MenschSchema>;
export default mongoose.model('Mensch', MenschSchema, 'menschen');
