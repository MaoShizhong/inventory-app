// Connect to MongoDB
require('dotenv').config();

const mongoose = require('mongoose');
const main = async () => await mongoose.connect(process.env.CONNECTION_STRING);
main().catch((err) => console.error(err));

const { Instrument } = require('../dist/models/instrument');
const { Manufacturer } = require('../dist/models/manufacturer');
const { Model } = require('../dist/models/model');
const { ModelInstance } = require('../dist/models/model_instance');

it('Connects to the inventory_app database and pre-populated models/collections exist', async () => {
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

it('Adds test document to "instrument" collection', async () => {
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

    expect(await isNewInstrumentInCollection(false)).toBe(false);
    expect(await isNewInstrumentInCollection(true)).toBe(true);
});

test('"instruments" collection should now contain 5 documents', async () => {
    expect(await Instrument.countDocuments({}).exec()).toBe(5);
});

it('Removes the test document previously added', async () => {
    await Instrument.findOneAndDelete({ type: 'Test' });

    async function isDeletedInstrumentStillInCollection() {
        const instrumentInCollection = await Instrument.findOne({ type: 'Test' });
        return !!instrumentInCollection;
    }

    expect(await isDeletedInstrumentStillInCollection()).toBe(false);
});

test('"instruments" collection should now be back to 4 documents after previous deletion', async () => {
    expect(await Instrument.countDocuments({}).exec()).toBe(4);
});
