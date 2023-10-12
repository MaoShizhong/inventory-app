import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { IManufacturer } from '../models/manufacturer';
import { IModel, Model } from '../models/model';
import { ModelInstance } from '../models/model_instance';

export const instanceForm_get = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const model = await Model.findById(req.query.model)
        .populate<{ manufacturer: IManufacturer }>('manufacturer')
        .exec();

    if (!model) {
        return res.render('404', { request: 'Model' });
    }

    res.render('forms/instance_form', {
        formTitle: `Add ${model.manufacturer.name} ${model.name} to stock`,
        model: model,
    });
});

export const instanceForm_post: FormPOSTHandler = [
    body('serial', 'Serial number cannot be empty')
        .trim()
        .notEmpty()
        .escape()
        .custom(async (serial): Promise<void> => {
            const existingSerial = await ModelInstance.findOne({ serial: serial }).exec();
            if (existingSerial) {
                throw new Error('An instrument with that serial number is already in stock');
            }
        }),

    body('colour').trim().escape(),

    body('material').trim().escape(),

    body('condition', "Condition may only be 'New' or 'Refurbished").isIn(['New', 'Refurbished']),

    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);

        const model = await Model.findById(req.query.model)
            .populate<{ manufacturer: IManufacturer }>('manufacturer')
            .exec();

        // In case somet
        if (!model) {
            return res.render('404', { request: 'Model' });
        }

        const newInstance = new ModelInstance({
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

        await newInstance.save();
        res.redirect(model.url);
    }),
];

export const instanceDetails_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const instrument = await ModelInstance.findById(req.params.id)
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
    }
);

export const removeFromStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const existingInstrument = await ModelInstance.findById(req.params.id)
        .populate<{ model: IModel }>({
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

    await ModelInstance.findByIdAndRemove(req.params.id);
    res.redirect(redirectURL);
});

export const updateInstance_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const instrument = await ModelInstance.findById(req.params.id).exec();

        if (!instrument) {
            return res.render('404', { request: 'In stock instrument' });
        }

        const model = await Model.findById(instrument.model).exec();

        res.render('forms/instance_form', {
            formTitle: `Edit ${instrument.serial}`,
            instance: instrument,
            modelPage: model!.url,
        });
    }
);

export const updateInstance_post: FormPOSTHandler = [
    body('serial', 'Serial number cannot be empty').trim().notEmpty().escape(),

    body('colour').trim().escape(),

    body('material').trim().escape(),

    body('condition', "Condition may only be 'New' or 'Refurbished").isIn(['New', 'Refurbished']),

    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);

        const oldInstance = await ModelInstance.findById(req.params.id)
            .populate<{ model: IModel }>('model')
            .exec();

        // In case somet
        if (!oldInstance) {
            return res.render('404', { request: 'In stock instrument' });
        }

        const newInstance = new ModelInstance({
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

        const updatedInstance = await ModelInstance.findByIdAndUpdate(
            req.params.id,
            newInstance,
            {}
        );

        res.redirect(updatedInstance!.url);
    }),
];
