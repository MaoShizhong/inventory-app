import { Schema, Types, model } from 'mongoose';
import { Model } from './model';

type ModelInstance = {
    model: Types.ObjectId;
    serial: string;
    colour?: string;
    material?: string;
    condition: 'New' | 'Refurbished';
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

// Change price based on instrument condition
ModelInstanceSchema.virtual('price').get(async function (): Promise<number> {
    const model = await Model.findById(this.model);

    return this.condition === 'Refurbished' ? model!.basePrice * 0.85 : model!.basePrice;
});

ModelInstanceSchema.virtual('url').get(function (): string {
    return `/inventory/instock/${this._id}`;
});

export const ModelInstance = model<ModelInstance>('ModelInstance', ModelInstanceSchema);
