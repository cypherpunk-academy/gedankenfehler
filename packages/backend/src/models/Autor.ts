import { InferSchemaType } from 'mongoose';
import mongoose from 'mongoose';

const AutorSchema = new mongoose.Schema({
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

export type Autor = InferSchemaType<typeof AutorSchema>;
export default mongoose.model('Autor', AutorSchema, 'autoren');
