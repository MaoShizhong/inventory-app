import { Schema, model } from 'mongoose';

export interface IInstrument {
    name: string;
    url: string;
}

const InstrumentSchema = new Schema<IInstrument>({
    name: { type: String, min: 1, required: true },
});

InstrumentSchema.virtual('url').get(function (): string {
    return `/inventory/instruments/${this._id}`;
});

export const Instrument = model<IInstrument>('Instrument', InstrumentSchema);
