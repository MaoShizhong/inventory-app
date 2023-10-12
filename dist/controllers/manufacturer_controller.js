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
exports.updateManufacturer_post = exports.updateManufacturer_get = exports.manufacturerDetail_get = exports.deleteManufacturer = exports.createNewManufacturer = exports.manufacturerForm_get = exports.allManufacturers_get = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
const manufacturer_1 = require("../models/manufacturer");
const model_1 = require("../models/model");
const model_instance_1 = require("../models/model_instance");
// List all instrument types
exports.allManufacturers_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allManufacturers = yield manufacturer_1.Manufacturer.find().sort({ name: 1 }).exec();
    res.render('list_all', {
        currentPath: 'manufacturers',
        categoryName: 'Manufacturer',
        categoryEntries: allManufacturers,
    });
}));
// Form for adding a manufacturer
const manufacturerForm_get = (req, res) => {
    res.render('forms/manufacturer_form', {
        formTitle: 'Add manufacturer',
    });
};
exports.manufacturerForm_get = manufacturerForm_get;
// Submitting the "add manufacturer" form
exports.createNewManufacturer = [
    (0, express_validator_1.body)('name', 'Manufacturer name cannot be empty').trim().notEmpty().escape(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        const newManufacturer = new manufacturer_1.Manufacturer({ name: req.body.name });
        if (!errors.isEmpty()) {
            res.render('forms/manufacturer_form', {
                instrument: newManufacturer,
                errors: errors.array(),
            });
        }
        else {
            const existingManufacturer = yield manufacturer_1.Manufacturer.findOne({ name: req.body.name })
                .collation({ locale: 'en', strength: 1 })
                .exec();
            if (existingManufacturer) {
                res.redirect(existingManufacturer.url);
            }
            else {
                yield newManufacturer.save();
                res.redirect(newManufacturer.url);
            }
        }
    })),
];
// Handle manufacturer deletion - will only be successful if no instock models using it
exports.deleteManufacturer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [manufacturer, modelsUsingManufacturer] = yield Promise.all([
        manufacturer_1.Manufacturer.findById(req.params.id).exec(),
        model_1.Model.find({ manufacturer: req.params.id }).exec(),
    ]);
    if (!manufacturer) {
        res.redirect('/inventory/manufacturers');
    }
    else if (modelsUsingManufacturer.length) {
        // Prevent deletion if any models exist that use the instrument type
        // Return to instrument detail page with error message showing
        const instrumentsInStock = yield model_instance_1.ModelInstance.find({
            model: { $in: modelsUsingManufacturer },
        })
            .populate({
            path: 'model',
            populate: {
                path: 'instrument',
            },
        })
            .exec();
        res.render('details', {
            cannotDeleteEntry: true,
            category: manufacturer,
            editBtnText: 'Name',
            deleteBtnText: 'Manufacturer',
            instrumentsInStock: instrumentsInStock,
        });
    }
    else {
        // Delete only if no models in stock of this instrument type
        yield manufacturer_1.Manufacturer.findByIdAndRemove(manufacturer._id);
        res.redirect('/inventory/manufacturers');
    }
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
    res.render('details', {
        category: manufacturer,
        editBtnText: 'Name',
        deleteBtnText: 'Manufacturer',
        instrumentsInStock: instrumentsInStock,
    });
}));
// Form for editing manufacturer name
exports.updateManufacturer_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Custom 404 page if URL ID field is not a valid ObjectID shape
    if (!mongoose_1.Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Manufacturer' });
    }
    const manufacturer = yield manufacturer_1.Manufacturer.findById(req.params.id).exec();
    // Custom 404 page
    if (!manufacturer) {
        return res.render('404', { request: 'Manufacturer' });
    }
    res.render('forms/manufacturer_form', {
        formTitle: `Edit ${manufacturer.name}`,
        manufacturer: manufacturer,
    });
}));
// Submitting new manufacturer name - only possible if name isn't already taken
exports.updateManufacturer_post = [
    (0, express_validator_1.body)('name', 'Manufacturer name cannot be empty').trim().notEmpty().escape(),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const oldManufacturer = yield manufacturer_1.Manufacturer.findById(req.params.id).exec();
        const errors = (0, express_validator_1.validationResult)(req);
        const manufacturer = new manufacturer_1.Manufacturer({
            _id: req.params.id,
            name: req.body.name,
        });
        if (!errors.isEmpty()) {
            res.render('forms/manufacturer_form', {
                formTitle: `Edit ${oldManufacturer.name}`,
                manufacturer: manufacturer,
                errors: errors.array(),
            });
        }
        const manufacturerExists = yield manufacturer_1.Manufacturer.findOne({ name: req.body.name })
            .collation({ locale: 'en', strength: 1 })
            .exec();
        if (manufacturerExists) {
            res.render('forms/manufacturer_form', {
                formTitle: `Edit ${oldManufacturer.name}`,
                manufacturer: manufacturer,
                errors: [
                    {
                        msg: 'Manufacturer already exists with that name, please pick another.',
                    },
                ],
            });
        }
        else {
            const updatedManufacturer = yield manufacturer_1.Manufacturer.findByIdAndUpdate(req.params.id, manufacturer, {});
            res.redirect(updatedManufacturer.url);
        }
    })),
];
