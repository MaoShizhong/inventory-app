import { Schema, model } from 'mongoose';

export interface IManufacturer {
    name: string;
    url: string;
}

const ManufacturerSchema = new Schema<IManufacturer>({
    name: { type: String, min: 1, required: true },
});

ManufacturerSchema.virtual('url').get(function (): string {
    return `/inventory/manufacturers/${this._id}`;
});

export const Manufacturer = model<IManufacturer>('Manufacturer', ManufacturerSchema);
