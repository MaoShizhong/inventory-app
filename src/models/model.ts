import { Schema, Types, model } from 'mongoose';
import { Manufacturer } from './manufacturer';

export interface IModel {
    _id: Types.ObjectId;
    instrument: Types.ObjectId;
    manufacturer: Types.ObjectId;
    name: string;
    description?: string[];
    basePrice: number;
    url: string;
}

const ModelSchema = new Schema<IModel>({
    instrument: { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
    manufacturer: { type: Schema.Types.ObjectId, ref: Manufacturer, required: true },
    name: { type: String, min: 1, required: true },
    description: { type: [String], default: undefined },
    basePrice: { type: Number, required: true },
});

ModelSchema.virtual('url').get(function (): string {
    return `/inventory/models/${this._id}`;
});

export const Model = model<IModel>('Model', ModelSchema);
