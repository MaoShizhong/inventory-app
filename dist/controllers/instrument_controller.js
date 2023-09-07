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
exports.updateInstrument_post = exports.updateInstrument_get = exports.deleteInstrument = exports.instrumentDetail_get = exports.createNewInstrument = exports.instrumentForm_get = exports.allInstruments_get = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const instrument_1 = require("../models/instrument");
const model_1 = require("../models/model");
const model_instance_1 = require("../models/model_instance");
const mongoose_1 = require("mongoose");
// List all instrument types
exports.allInstruments_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allInstruments = yield instrument_1.Instrument.find().sort({ name: 1 }).exec();
    res.render('list_all', {
        page: 'Instruments',
        currentPath: 'instruments',
        categoryName: 'Instrument Type',
        categoryEntries: allInstruments,
    });
}));
// Form for adding an instrument type
const instrumentForm_get = (req, res) => {
    res.render('forms/instrument_form', {
        page: 'Add instrument',
        formTitle: 'Add instrument type',
    });
};
exports.instrumentForm_get = instrumentForm_get;
// Submitting the "add instrument type" form
exports.createNewInstrument = [
    (0, express_validator_1.body)('name', 'Instrument name cannot be empty').trim().notEmpty().escape(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        const newInstrument = new instrument_1.Instrument({ name: req.body.name });
        if (!errors.isEmpty()) {
            res.render('forms/instrument_form', {
                page: 'Add instrument',
                instrument: newInstrument,
                errors: errors.array(),
            });
        }
        else {
            const existingInstrument = yield instrument_1.Instrument.findOne({ name: req.body.name })
                .collation({ locale: 'en', strength: 1 })
                .exec();
            if (existingInstrument) {
                res.redirect(existingInstrument.url);
            }
            else {
                yield newInstrument.save();
                res.redirect(newInstrument.url);
            }
        }
    })),
];
// Get list of all instruments in stock for that type
exports.instrumentDetail_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Instrument type' });
    }
    // Fetch instrument and models of that instrument (models for use in instance search later)
    const [instrumentType, modelsInStock] = yield Promise.all([
        instrument_1.Instrument.findById(req.params.id).exec(),
        model_1.Model.find({ instrument: req.params.id }).exec(),
    ]);
    if (!instrumentType) {
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
    res.render('details', {
        page: instrumentType.name,
        isInstrumentPage: true,
        category: instrumentType,
        editBtnText: 'Name',
        deleteBtnText: 'Instrument',
        instrumentsInStock: instrumentsInStock,
    });
}));
// Handle instrument deletion - will only be successful if no instock models using it
exports.deleteInstrument = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [instrumentType, modelsUsingInstrument] = yield Promise.all([
        instrument_1.Instrument.findById(req.params.id).exec(),
        model_1.Model.find({ instrument: req.params.id }).exec(),
    ]);
    if (!instrumentType) {
        res.redirect('/inventory/instruments');
    }
    else if (modelsUsingInstrument.length) {
        // Prevent deletion if any models exist that use the instrument type
        // Return to instrument detail page with error message showing
        const instrumentsInStock = yield model_instance_1.ModelInstance.find({
            model: { $in: modelsUsingInstrument },
        })
            .populate({
            path: 'model',
            populate: {
                path: 'manufacturer',
            },
        })
            .exec();
        res.render('details', {
            cannotDeleteEntry: true,
            isInstrumentPage: true,
            page: instrumentType.name,
            category: instrumentType,
            editBtnText: 'Name',
            deleteBtnText: 'Instrument',
            instrumentsInStock: instrumentsInStock,
        });
    }
    else {
        // Delete only if no models in stock of this instrument type
        yield instrument_1.Instrument.findByIdAndRemove(instrumentType._id);
        res.redirect('/inventory/instruments');
    }
}));
// Form for editing instrument type name
exports.updateInstrument_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Custom 404 page if URL ID field is not a valid ObjectID shape
    if (!mongoose_1.Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Instrument type' });
    }
    const instrument = yield instrument_1.Instrument.findById(req.params.id).exec();
    // Custom 404 page
    if (!instrument) {
        return res.render('404', { request: 'Instrument type' });
    }
    res.render('forms/instrument_form', {
        page: `Edit ${instrument.name}`,
        formTitle: `Edit ${instrument.name}`,
        instrument: instrument,
    });
}));
// Submitting new instrument type name - only possible if name isn't already taken
exports.updateInstrument_post = [
    (0, express_validator_1.body)('name', 'Instrument name cannot be empty').trim().notEmpty().escape(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const oldInstrument = yield instrument_1.Instrument.findById(req.params.id).exec();
        const errors = (0, express_validator_1.validationResult)(req);
        const instrument = new instrument_1.Instrument({
            _id: req.params.id,
            name: req.body.name,
        });
        if (!errors.isEmpty()) {
            res.render('forms/instrument_form', {
                page: `Edit ${oldInstrument.name}`,
                formTitle: `Edit ${oldInstrument.name}`,
                instrument: instrument,
                errors: errors.array(),
            });
        }
        const instrumentExists = yield instrument_1.Instrument.findOne({ name: req.body.name })
            .collation({ locale: 'en', strength: 1 })
            .exec();
        if (instrumentExists) {
            res.render('forms/instrument_form', {
                page: `Edit ${oldInstrument.name}`,
                formTitle: `Edit ${oldInstrument.name}`,
                instrument: instrument,
                errors: [
                    {
                        msg: 'Instrument type already exists with that name, please pick another.',
                    },
                ],
            });
        }
        else {
            const updatedInstrument = yield instrument_1.Instrument.findByIdAndUpdate(req.params.id, instrument, {});
            res.redirect(updatedInstrument.url);
        }
    })),
];
