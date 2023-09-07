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
exports.updateModel_post = exports.updateModel_get = exports.deleteModel = exports.modelDetail_get = exports.createNewModel = exports.modelForm_get = exports.allModels_get = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const model_1 = require("../models/model");
const model_instance_1 = require("../models/model_instance");
const mongoose_1 = require("mongoose");
const instrument_1 = require("../models/instrument");
const manufacturer_1 = require("../models/manufacturer");
// List all models sorted by instrument then manufacturer
exports.allModels_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [allModels, allInstrumentTypes] = yield Promise.all([
        model_1.Model.find()
            .populate('instrument')
            .populate('manufacturer')
            .sort({ 'manufacturer.name': 1, name: 1 })
            .exec(),
        instrument_1.Instrument.find().sort({ name: 1 }).exec(),
    ]);
    res.render('list_all', {
        page: 'Models',
        currentPath: 'models',
        categoryName: 'Model',
        allModels: allModels,
        instrumentTypes: allInstrumentTypes,
        isListOfModels: true,
    });
}));
// Form for adding an instrument model
exports.modelForm_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [instruments, manufacturers] = yield Promise.all([
        instrument_1.Instrument.find().sort({ name: 1 }).exec(),
        manufacturer_1.Manufacturer.find().sort({ name: 1 }).exec(),
    ]);
    res.render('forms/model_form', {
        page: 'Add model',
        formTitle: 'Add model',
        instrumentTypes: instruments,
        manufacturers: manufacturers,
    });
}));
// Submitting the "add instrument model" form
exports.createNewModel = [
    (0, express_validator_1.body)('instrument').trim().notEmpty().escape().custom(invalidateIfExistingInstrumentType),
    (0, express_validator_1.body)('manufacturer').trim().notEmpty().escape().custom(invalidateIfExistingManufacturer),
    (0, express_validator_1.body)('name', 'Model name cannot be empty').trim().notEmpty().escape(),
    (0, express_validator_1.body)('description').trim().escape().customSanitizer(convertToArrayOfParagraphs),
    (0, express_validator_1.body)('baseprice', 'Base price cannot be below £0.00').isFloat({ min: 0 }),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        const [selectedInstrument, selectedManufacturer] = yield Promise.all([
            instrument_1.Instrument.findOne({ name: req.body.instrument }),
            manufacturer_1.Manufacturer.findOne({ name: req.body.manufacturer }),
        ]);
        const newModel = new model_1.Model({
            instrument: selectedInstrument === null || selectedInstrument === void 0 ? void 0 : selectedInstrument._id,
            manufacturer: selectedManufacturer === null || selectedManufacturer === void 0 ? void 0 : selectedManufacturer._id,
            name: req.body.name,
            description: req.body.description,
            basePrice: req.body.baseprice,
        });
        if (!errors.isEmpty()) {
            res.render('forms/model_form', {
                page: 'Add model',
                model: newModel,
                errors: errors.array(),
            });
        }
        const existingModel = yield model_1.Model.findOne({
            instrument: selectedInstrument === null || selectedInstrument === void 0 ? void 0 : selectedInstrument._id,
            manufacturer: selectedManufacturer === null || selectedManufacturer === void 0 ? void 0 : selectedManufacturer._id,
            name: req.body.name,
        })
            .collation({ locale: 'en', strength: 1 })
            .exec();
        if (existingModel) {
            res.redirect(existingModel.url);
        }
        else {
            yield newModel.save();
            res.redirect(newModel.url);
        }
    })),
];
// Get list of all instruments in stock for that type
exports.modelDetail_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Instrument model' });
    }
    // Fetch instrument and models of that instrument (models for use in instance search later)
    const model = yield model_1.Model.findById(req.params.id)
        .populate('instrument')
        .populate('manufacturer')
        .exec();
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
    res.render('details', {
        category: model,
        isModelPage: true,
        editBtnText: 'Model',
        deleteBtnText: 'Model',
        instrumentsInStock: instrumentsInStock,
    });
}));
// Handle instrument deletion - will only be successful if no instock models using it
exports.deleteModel = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [model, modelInstancesInStock] = yield Promise.all([
        model_1.Model.findById(req.params.id).exec(),
        model_instance_1.ModelInstance.find({ model: req.params.id })
            .populate({
            path: 'model',
            populate: {
                path: 'manufacturer',
            },
        })
            .exec(),
    ]);
    if (!model) {
        res.redirect('/inventory/models');
    }
    else if (modelInstancesInStock.length) {
        // Prevent deletion of model if any in instances in stock
        // Return to model detail page with error message showing
        res.render('details', {
            cannotDeleteEntry: true,
            isModelPage: true,
            page: model.name,
            category: model,
            editBtnText: 'Name',
            deleteBtnText: 'Model',
            instrumentsInStock: modelInstancesInStock,
        });
    }
    else {
        // Delete only if no instances of this model in stock
        yield model_1.Model.findByIdAndRemove(model._id);
        res.redirect('/inventory/models');
    }
}));
// Form for editing model name
exports.updateModel_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Custom 404 page if URL ID field is not a valid ObjectID shape
    if (!mongoose_1.Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Model' });
    }
    const [model, instrumentTypes, manufacturers] = yield Promise.all([
        model_1.Model.findById(req.params.id).exec(),
        instrument_1.Instrument.find().sort({ name: 1 }).exec(),
        manufacturer_1.Manufacturer.find().sort({ name: 1 }).exec(),
    ]);
    // Custom 404 page
    if (!model) {
        return res.render('404', { request: 'Model' });
    }
    res.render('forms/model_form', {
        page: `Edit ${model.name}`,
        formTitle: `Edit ${model.name}`,
        model: model,
        instrumentTypes: instrumentTypes,
        manufacturers: manufacturers,
    });
}));
// Submitting new model name - only possible if name isn't already taken
exports.updateModel_post = [
    (0, express_validator_1.body)('instrument').trim().notEmpty().escape().custom(invalidateIfExistingInstrumentType),
    (0, express_validator_1.body)('manufacturer').trim().notEmpty().escape().custom(invalidateIfExistingManufacturer),
    (0, express_validator_1.body)('name', 'Model name cannot be empty').trim().notEmpty().escape(),
    (0, express_validator_1.body)('description').trim().escape().customSanitizer(convertToArrayOfParagraphs),
    (0, express_validator_1.body)('baseprice', 'Base price cannot be below £0.00').isFloat({ min: 0 }),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const oldModel = yield model_1.Model.findById(req.params.id).exec();
        const errors = (0, express_validator_1.validationResult)(req);
        const [selectedInstrument, selectedManufacturer, instrumentTypes, manufacturers] = yield Promise.all([
            instrument_1.Instrument.findOne({ name: req.body.instrument }),
            manufacturer_1.Manufacturer.findOne({ name: req.body.manufacturer }),
            instrument_1.Instrument.find().sort({ name: 1 }).exec(),
            manufacturer_1.Manufacturer.find().sort({ name: 1 }).exec(),
        ]);
        const model = new model_1.Model({
            _id: req.params.id,
            instrument: selectedInstrument === null || selectedInstrument === void 0 ? void 0 : selectedInstrument._id,
            manufacturer: selectedManufacturer === null || selectedManufacturer === void 0 ? void 0 : selectedManufacturer._id,
            name: req.body.name,
            description: req.body.description,
            basePrice: req.body.baseprice,
        });
        if (!errors.isEmpty()) {
            res.render('forms/model_form', {
                page: `Edit ${model.name}`,
                model: model,
                instrumentTypes: instrumentTypes,
                manufacturers: manufacturers,
                errors: errors.array(),
            });
        }
        const duplicateModel = yield model_1.Model.findOne({
            instrument: selectedInstrument === null || selectedInstrument === void 0 ? void 0 : selectedInstrument._id,
            manufacturer: selectedManufacturer === null || selectedManufacturer === void 0 ? void 0 : selectedManufacturer._id,
            name: req.body.name,
        })
            .collation({ locale: 'en', strength: 1 })
            .exec();
        if (duplicateModel) {
            res.render('forms/model_form', {
                page: `Edit ${oldModel.name}`,
                formTitle: `Edit ${oldModel.name}`,
                model: model,
                instrumentTypes: instrumentTypes,
                manufacturers: manufacturers,
                errors: [
                    {
                        msg: 'Model already exists with that name, please pick another.',
                    },
                ],
            });
        }
        else {
            const updatedModel = yield model_1.Model.findByIdAndUpdate(req.params.id, model, {});
            res.redirect(updatedModel.url);
        }
    })),
];
function invalidateIfExistingInstrumentType(instrumentName) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingInstrument = yield instrument_1.Instrument.findOne({ name: instrumentName });
        if (!existingInstrument) {
            throw new Error('Selected instrument does not exist! Please select from the list of existing instrument types.');
        }
    });
}
function invalidateIfExistingManufacturer(manufacturerName) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingManufacturer = yield manufacturer_1.Manufacturer.findOne({ name: manufacturerName });
        if (!existingManufacturer) {
            throw new Error('Selected manufacturer does not exist! Please select from the list of existing manufacturers.');
        }
    });
}
function convertToArrayOfParagraphs(text) {
    // Only converts if description is present - empty string will return
    // undefined so the document does omits the description field
    const textWithSingleLineBreaks = text.replaceAll('\r', '').replaceAll(/\n+/g, '\n');
    return text === '' ? undefined : textWithSingleLineBreaks.split('\n');
}
