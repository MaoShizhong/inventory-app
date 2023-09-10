import { Schema, Types, model } from 'mongoose';
import { Model } from './model';

type ModelInstance = {
    _id: Types.ObjectId;
    model: Types.ObjectId;
    serial: string;
    colour?: string;
    material?: string;
    condition: 'New' | 'Refurbished';
    url: string;
};

const ModelInstanceSchema = new Schema<ModelInstance>({
    model: { type: Schema.Types.ObjectId, ref: Model, required: true },
    serial: { type: String, required: true },
    colour: String,
    material: String,
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Refurbished'],
        default: 'New',
    },
});

ModelInstanceSchema.virtual('url').get(function (): string {
    return `/inventory/instock/${this._id}`;
});

export const ModelInstance = model<ModelInstance>('ModelInstance', ModelInstanceSchema);
