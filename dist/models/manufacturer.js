"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manufacturer = void 0;
const mongoose_1 = require("mongoose");
const ManufacturerSchema = new mongoose_1.Schema({
    name: { type: String, min: 1, required: true },
});
ManufacturerSchema.virtual('url').get(function () {
    return `/inventory/manufacturer/${this._id}`;
});
exports.Manufacturer = (0, mongoose_1.model)('Manufacturer', ManufacturerSchema);
