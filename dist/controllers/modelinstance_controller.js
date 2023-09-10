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
exports.updateInstance_post = exports.updateInstance_get = exports.removeFromStock = exports.instanceDetails_get = exports.instanceForm_post = exports.instanceForm_get = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const model_1 = require("../models/model");
const model_instance_1 = require("../models/model_instance");
exports.instanceForm_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const model = yield model_1.Model.findById(req.query.model)
        .populate('manufacturer')
        .exec();
    if (!model) {
        return res.render('404', { request: 'Model' });
    }
    res.render('forms/instance_form', {
        formTitle: `Add ${model.manufacturer.name} ${model.name} to stock`,
        model: model,
    });
}));
exports.instanceForm_post = [
    (0, express_validator_1.body)('serial', 'Serial number cannot be empty')
        .trim()
        .notEmpty()
        .escape()
        .custom((serial) => __awaiter(void 0, void 0, void 0, function* () {
        const existingSerial = yield model_instance_1.ModelInstance.findOne({ serial: serial }).exec();
        if (existingSerial) {
            throw new Error('An instrument with that serial number is already in stock');
        }
    })),
    (0, express_validator_1.body)('colour').trim().escape(),
    (0, express_validator_1.body)('material').trim().escape(),
    (0, express_validator_1.body)('condition', "Condition may only be 'New' or 'Refurbished").isIn(['New', 'Refurbished']),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        const model = yield model_1.Model.findById(req.query.model)
            .populate('manufacturer')
            .exec();
        // In case somet
        if (!model) {
            return res.render('404', { request: 'Model' });
        }
        const newInstance = new model_instance_1.ModelInstance({
            model: model._id,
            serial: req.body.serial,
            colour: req.body.colour || undefined,
            material: req.body.material || undefined,
            condition: req.body.condition,
        });
        if (!errors.isEmpty()) {
            return res.render('forms/instance_form', {
                formTitle: `Add ${model.manufacturer.name} ${model.name} to stock`,
                modelPage: model.url,
                instance: newInstance,
                errors: errors.array(),
            });
        }
        yield newInstance.save();
        res.redirect(model.url);
    })),
];
exports.instanceDetails_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const instrument = yield model_instance_1.ModelInstance.findById(req.params.id)
        .populate({
        path: 'model',
        populate: [{ path: 'instrument' }, { path: 'manufacturer' }],
    })
        .exec();
    if (!instrument) {
        return res.render('404', { request: 'Instrument in stock' });
    }
    res.render('model_instance', {
        instrument: instrument,
        cameFrom: req.query.from,
    });
}));
exports.removeFromStock = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const existingInstrument = yield model_instance_1.ModelInstance.findById(req.params.id)
        .populate({
        path: 'model',
        populate: [{ path: 'instrument' }, { path: 'manufacturer' }],
    })
        .exec();
    if (!existingInstrument) {
        return res.render('404', { request: 'Instrument in stock' });
    }
    let redirectURL;
    switch (req.query.from) {
        case 'model':
            redirectURL = existingInstrument.model.url;
            break;
        case 'instrument':
            redirectURL = existingInstrument.model.instrument.url;
            break;
        case 'manufacturer':
            redirectURL = existingInstrument.model.manufacturer.url;
            break;
        default:
            redirectURL = '/';
            break;
    }
    yield model_instance_1.ModelInstance.findByIdAndRemove(req.params.id);
    res.redirect(redirectURL);
}));
exports.updateInstance_get = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const instrument = yield model_instance_1.ModelInstance.findById(req.params.id).exec();
    if (!instrument) {
        return res.render('404', { request: 'In stock instrument' });
    }
    const model = yield model_1.Model.findById(instrument.model).exec();
    res.render('forms/instance_form', {
        formTitle: `Edit ${instrument.serial}`,
        instance: instrument,
        modelPage: model.url,
    });
}));
exports.updateInstance_post = [
    (0, express_validator_1.body)('serial', 'Serial number cannot be empty').trim().notEmpty().escape(),
    (0, express_validator_1.body)('colour').trim().escape(),
    (0, express_validator_1.body)('material').trim().escape(),
    (0, express_validator_1.body)('condition', "Condition may only be 'New' or 'Refurbished").isIn(['New', 'Refurbished']),
    (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        const oldInstance = yield model_instance_1.ModelInstance.findById(req.params.id)
            .populate('model')
            .exec();
        // In case somet
        if (!oldInstance) {
            return res.render('404', { request: 'In stock instrument' });
        }
        const newInstance = new model_instance_1.ModelInstance({
            _id: req.params.id,
            model: oldInstance.model._id,
            serial: req.body.serial,
            colour: req.body.colour || undefined,
            material: req.body.material || undefined,
            condition: req.body.condition,
        });
        if (!errors.isEmpty()) {
            return res.render('forms/instance_form', {
                formTitle: `Edit ${oldInstance.serial}`,
                modelPage: oldInstance.model.url,
                instance: newInstance,
                errors: errors.array(),
            });
        }
        const updatedInstance = yield model_instance_1.ModelInstance.findByIdAndUpdate(req.params.id, newInstance, {});
        console.log(oldInstance.url);
        console.log('----');
        console.log(updatedInstance.url);
        res.redirect(updatedInstance.url);
    })),
];
