"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const mongoose_1 = require("mongoose");
const ModelSchema = new mongoose_1.Schema({
    instrument: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Instrument', required: true },
    manufacturer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
    name: { type: String, min: 1, required: true },
    description: [String],
    basePrice: { type: Number, required: true },
});
ModelSchema.virtual('url').get(function () {
    return `/inventory/models/${this._id}`;
});
exports.Model = (0, mongoose_1.model)('Model', ModelSchema);
