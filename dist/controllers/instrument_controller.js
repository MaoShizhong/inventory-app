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
exports.instrumentDetail_get = exports.allInstruments_get = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const instrument_1 = require("../models/instrument");
const model_1 = require("../models/model");
const model_instance_1 = require("../models/model_instance");
const mongoose_1 = require("mongoose");
// List all instrument types
exports.allInstruments_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allInstruments = yield instrument_1.Instrument.find().exec();
    res.render('instruments/all_instrument_types', {
        title: 'All Instrument Types:',
        allInstruments: allInstruments,
    });
}));
// Get list of all instruments in stock for that type
exports.instrumentDetail_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Instrument type' });
    }
    // Fetch instrument and models of that instrument (models for use in instance search later)
    const [instrument, modelsInStock] = yield Promise.all([
        instrument_1.Instrument.findById(req.params.id).exec(),
        model_1.Model.find({ instrument: req.params.id }).exec(),
    ]);
    if (!instrument) {
        return res.render('404', { request: 'Instrument type' });
    }
    // Can only search for model instances after first retrieving the right models as above
    const instrumentsInStock = yield model_instance_1.ModelInstance.find({ model: { $in: modelsInStock } })
        .populate({
        path: 'model',
        populate: {
            path: 'manufacturer',
        },
    })
        .exec();
    res.render('instruments/instrument_detail', {
        title: instrument.type,
        instrumentsInStock: instrumentsInStock,
    });
}));
