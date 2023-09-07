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
exports.modelDetail_get = exports.allModels_get = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const model_1 = require("../models/model");
const model_instance_1 = require("../models/model_instance");
const mongoose_1 = require("mongoose");
const instrument_1 = require("../models/instrument");
// List all instrument types
exports.allModels_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [allModels, allInstrumentTypes] = yield Promise.all([
        model_1.Model.find().populate('instrument').exec(),
        instrument_1.Instrument.find().exec(),
    ]);
    res.render('list_all', {
        currentPath: 'models',
        categoryName: 'Model',
        allModels: allModels,
        instrumentTypes: allInstrumentTypes,
        isListOfModels: true,
    });
}));
// Get list of all instruments in stock for that type
exports.modelDetail_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Instrument model' });
    }
    // Fetch instrument and models of that instrument (models for use in instance search later)
    const model = yield model_1.Model.findById(req.params.id).populate('instrument').exec();
    if (!model) {
        return res.render('404', { request: 'Instrument model' });
    }
    // Can only search for model instances after first retrieving the right models as above
    const instrumentsInStock = yield model_instance_1.ModelInstance.find({ model: model })
        .populate({
        path: 'model',
        populate: [{ path: 'instrument' }, { path: 'manufacturer' }],
    })
        .exec();
    res.render('details/model_detail', {
        category: model,
        isModelPage: true,
        editBtnText: 'Model',
        deleteBtnText: 'Model',
        instrumentsInStock: instrumentsInStock,
    });
}));
