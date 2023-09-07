import { Schema, model } from 'mongoose';

type Manufacturer = {
    name: string;
    url: string;
};

const ManufacturerSchema = new Schema<Manufacturer>({
    name: { type: String, min: 1, required: true },
});

ManufacturerSchema.virtual('url').get(function (): string {
    return `/inventory/manufacturers/${this._id}`;
});

export const Manufacturer = model<Manufacturer>('Manufacturer', ManufacturerSchema);
