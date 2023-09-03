import { Schema, Types, model } from 'mongoose';

type Model = {
    instrument: Types.ObjectId;
    manufacturer: Types.ObjectId;
    name: string;
    description?: string[];
    basePrice: number;
};

const ModelSchema = new Schema<Model>({
    instrument: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
    manufacturer: { type: Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
    name: { type: String, min: 1, required: true },
    description: [String],
    basePrice: { type: Number, required: true },
});

ModelSchema.virtual('url').get(function (): string {
    return `/inventory/models/${this._id}`;
});

export const Model = model<Model>('Model', ModelSchema);
