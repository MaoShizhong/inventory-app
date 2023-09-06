"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelInstance = void 0;
const mongoose_1 = require("mongoose");
const model_1 = require("./model");
const ModelInstanceSchema = new mongoose_1.Schema({
    model: { type: mongoose_1.Schema.Types.ObjectId, ref: model_1.Model, required: true },
    serial: { type: String, required: true },
    colour: String,
    material: String,
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Refurbished'],
        default: 'New',
    },
});
// Change price based on instrument condition
// ModelInstanceSchema.virtual('price').get(async function (): Promise<number> {
//     const model = await Model.findById(this.model);
//     const price = this.condition === 'Refurbished' ? model!.basePrice * 0.85 : model!.basePrice;
//     console.log(price);
//     return price;
// });
ModelInstanceSchema.virtual('url').get(function () {
    return `/inventory/instock/${this._id}`;
});
exports.ModelInstance = (0, mongoose_1.model)('ModelInstance', ModelInstanceSchema);
