"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instrument = void 0;
const mongoose_1 = require("mongoose");
const InstrumentSchema = new mongoose_1.Schema({
    name: { type: String, min: 1, required: true },
});
InstrumentSchema.virtual('url').get(function () {
    return `/inventory/instruments/${this._id}`;
});
exports.Instrument = (0, mongoose_1.model)('Instrument', InstrumentSchema);
