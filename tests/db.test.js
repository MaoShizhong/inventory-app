// Connect to MongoDB
require('dotenv').config();

const mongoose = require('mongoose');
const main = async () => await mongoose.connect(process.env.CONNECTION_STRING);
main().catch((err) => console.error(err));

const { Instrument } = require('../dist/models/instrument');
const { Manufacturer } = require('../dist/models/manufacturer');
const { Model } = require('../dist/models/model');
const { ModelInstance } = require('../dist/models/model_instance');

it('Connects to the correct database and created models/collections exist', async () => {
    /*
        At the time of testing, the database above was preloaded with 4 collections:
        - instruments - 4 documents
        - manufacturers - 4 documents
        - models - 6 documents
        - modelInstances - 7 documents
    */

    const [instrumentCount, manufacturerCount, modelCount, modelInstanceCount] = await Promise.all([
        Instrument.countDocuments({}).exec(),
        Manufacturer.countDocuments({}).exec(),
        Model.countDocuments({}).exec(),
        ModelInstance.countDocuments({}).exec(),
    ]);

    expect(instrumentCount).toBe(4);
    expect(manufacturerCount).toBe(4);
    expect(modelCount).toBe(6);
    expect(modelInstanceCount).toBe(7);
});

it('Correctly adds documents to an existing collection', async () => {
    async function isNewInstrumentInCollection(shouldAddInstrument) {
        if (shouldAddInstrument) {
            const newInstrument = new Instrument({
                type: 'Test',
            });
            await newInstrument.save();
        }

        const instrumentInCollection = await Instrument.findOne({ type: 'Test' });
        return !!instrumentInCollection;
    }

    async function isDeletedInstrumentStillInCollection() {
        await Instrument.findOneAndDelete({ type: 'Test' });

        const instrumentInCollection = await Instrument.findOne({ type: 'Test' });
        return !!instrumentInCollection;
    }

    expect(await isNewInstrumentInCollection(false)).toBe(false);
    expect(await isNewInstrumentInCollection(true)).toBe(true);
    expect(await Instrument.countDocuments({}).exec()).toBe(5);
    expect(await isDeletedInstrumentStillInCollection()).toBe(false);
    expect(await Instrument.countDocuments({}).exec()).toBe(4);
});
