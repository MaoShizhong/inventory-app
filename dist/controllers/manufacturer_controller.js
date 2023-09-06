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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manufacturerDetail_get = exports.allManufacturers_get = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const model_1 = require("../models/model");
const model_instance_1 = require("../models/model_instance");
const mongoose_1 = require("mongoose");
const manufacturer_1 = require("../models/manufacturer");
// List all instrument types
exports.allManufacturers_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allManufacturers = yield manufacturer_1.Manufacturer.find().exec();
    res.render('manufacturers/all_manufacturers', {
        title: 'All Manufacturers:',
        allManufacturers: allManufacturers,
    });
}));
// Get list of all instruments in stock for that type
exports.manufacturerDetail_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
        Required here otherwise invalid ObjectID error is thrown during querying and
        before the following conditional can run.
    */
    if (!mongoose_1.Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Manufacturer' });
    }
    // Fetch instrument and models of that instrument (models for use in instance search later)
    const [manufacturer, modelsInStock] = yield Promise.all([
        manufacturer_1.Manufacturer.findById(req.params.id).exec(),
        model_1.Model.find({ manufacturer: req.params.id }).exec(),
    ]);
    if (!manufacturer) {
        return res.render('404', { request: 'Manufacturer' });
    }
    // Can only search for model instances after first retrieving the right models as above
    const instrumentsInStock = yield model_instance_1.ModelInstance.find({ model: { $in: modelsInStock } })
        .populate({
        path: 'model',
        populate: {
            path: 'instrument',
        },
    })
        .exec();
    res.render('manufacturers/manufacturer_detail', {
        title: manufacturer.name,
        instrumentsInStock: instrumentsInStock,
    });
}));
