import { Schema, model } from 'mongoose';

type Instrument = {
    type: string;
};

const InstrumentSchema = new Schema<Instrument>({
    type: { type: String, min: 1, required: true },
});

InstrumentSchema.virtual('url').get(function (): string {
    return `/inventory/instrument/${this.type}`;
});

export const Instrument = model<Instrument>('Instrument', InstrumentSchema);
