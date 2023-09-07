import { Schema, model } from 'mongoose';

type Instrument = {
    name: string;
    url: string;
};

const InstrumentSchema = new Schema<Instrument>({
    name: { type: String, min: 1, required: true },
});

InstrumentSchema.virtual('url').get(function (): string {
    return `/inventory/instruments/${this._id}`;
});

export const Instrument = model<Instrument>('Instrument', InstrumentSchema);
