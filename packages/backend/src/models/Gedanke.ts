import mongoose, { InferSchemaType } from 'mongoose';

const GedankeSchema = new mongoose.Schema({
    /** @deprecated Use autorId instead */
    autor: { type: String, required: false },
    autorId: { type: String, required: true },
    weltanschauung: { type: String, required: true },
    created_at: { type: String, required: true },
    ausgangsgedanke: { type: String, required: true },
    ausgangsgedanke_in_weltanschauung: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    gedanke: { type: String, required: true },
    gedanke_einfach: { type: String, required: true },
    gedanke_kurz: { type: String, required: true },
    nummer: { type: Number, required: true },
    model: { type: String, default: '' },
    rank: { type: Number, required: true },
});

GedankeSchema.index({ weltanschauung: 1, nummer: 1 });
GedankeSchema.index({ created_at: 1 });
GedankeSchema.index({ weltanschauung: 1 });
GedankeSchema.index({ nummer: 1 });
GedankeSchema.index({ autorId: 1 });

export type Gedanke = InferSchemaType<typeof GedankeSchema>;
export default mongoose.model<Gedanke>('Gedanke', GedankeSchema, 'gedanken');
