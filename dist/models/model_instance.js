"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
ModelInstanceSchema.virtual('price').get(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const model = yield model_1.Model.findById(this.model);
        return this.condition === 'Refurbished' ? model.basePrice * 0.85 : model.basePrice;
    });
});
ModelInstanceSchema.virtual('url').get(function () {
    return `/inventory/instock/${this._id}`;
});
exports.ModelInstance = (0, mongoose_1.model)('ModelInstance', ModelInstanceSchema);
