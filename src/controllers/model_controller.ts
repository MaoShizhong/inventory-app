import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { Model } from '../models/model';
import { ModelInstance } from '../models/model_instance';
import { Types } from 'mongoose';
import { Instrument } from '../models/instrument';
import { Manufacturer } from '../models/manufacturer';

// List all models sorted by instrument then manufacturer
export const allModels_get = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const [allModels, allInstrumentTypes] = await Promise.all([
        Model.find()
            .populate('instrument')
            .populate('manufacturer')
            .sort({ 'manufacturer.name': 1, name: 1 })
            .exec(),
        Instrument.find().sort({ name: 1 }).exec(),
    ]);

    res.render('list_all', {
        page: 'Models',
        currentPath: 'models',
        categoryName: 'Model',
        allModels: allModels,
        instrumentTypes: allInstrumentTypes,
        isListOfModels: true,
    });
});

// Form for adding an instrument model
export const modelForm_get = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const [instruments, manufacturers] = await Promise.all([
        Instrument.find().sort({ name: 1 }).exec(),
        Manufacturer.find().sort({ name: 1 }).exec(),
    ]);

    res.render('forms/model_form', {
        page: 'Add model',
        formTitle: 'Add model',
        instrumentTypes: instruments,
        manufacturers: manufacturers,
    });
});

// Submitting the "add instrument model" form
export const createNewModel: FormPOSTHandler = [
    body('instrument').trim().notEmpty().escape().custom(invalidateIfExistingInstrumentType),

    body('manufacturer').trim().notEmpty().escape().custom(invalidateIfExistingManufacturer),

    body('name', 'Model name cannot be empty').trim().notEmpty().escape(),

    body('description').trim().escape().customSanitizer(convertToArrayOfParagraphs),

    body('baseprice', 'Base price cannot be below £0.00').isFloat({ min: 0 }),

    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);

        const [selectedInstrument, selectedManufacturer] = await Promise.all([
            Instrument.findOne({ name: req.body.instrument }),
            Manufacturer.findOne({ name: req.body.manufacturer }),
        ]);

        const newModel = new Model({
            instrument: selectedInstrument?._id,
            manufacturer: selectedManufacturer?._id,
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

        const existingModel = await Model.findOne({
            instrument: selectedInstrument?._id,
            manufacturer: selectedManufacturer?._id,
            name: req.body.name,
        })
            .collation({ locale: 'en', strength: 1 })
            .exec();

        if (existingModel) {
            res.redirect(existingModel.url);
        } else {
            await newModel.save();
            res.redirect(newModel.url);
        }
    }),
];

// Get list of all instruments in stock for that type
export const modelDetail_get = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Instrument model' });
    }

    // Fetch instrument and models of that instrument (models for use in instance search later)
    const model = await Model.findById(req.params.id)
        .populate('instrument')
        .populate('manufacturer')
        .exec();

    if (!model) {
        return res.render('404', { request: 'Instrument model' });
    }

    // Can only search for model instances after first retrieving the right models as above
    const instrumentsInStock = await ModelInstance.find({ model: model })
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
});

// Handle instrument deletion - will only be successful if no instock models using it
export const deleteModel = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const [model, modelInstancesInStock] = await Promise.all([
        Model.findById(req.params.id).exec(),
        ModelInstance.find({ model: req.params.id })
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
    } else if (modelInstancesInStock.length) {
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
    } else {
        // Delete only if no instances of this model in stock
        await Model.findByIdAndRemove(model._id);
        res.redirect('/inventory/models');
    }
});

// Form for editing model name
export const updateModel_get = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Custom 404 page if URL ID field is not a valid ObjectID shape
    if (!Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Model' });
    }

    const [model, instrumentTypes, manufacturers] = await Promise.all([
        Model.findById(req.params.id).exec(),
        Instrument.find().sort({ name: 1 }).exec(),
        Manufacturer.find().sort({ name: 1 }).exec(),
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
});

// Submitting new model name - only possible if name isn't already taken
export const updateModel_post: FormPOSTHandler = [
    body('instrument').trim().notEmpty().escape().custom(invalidateIfExistingInstrumentType),

    body('manufacturer').trim().notEmpty().escape().custom(invalidateIfExistingManufacturer),

    body('name', 'Model name cannot be empty').trim().notEmpty().escape(),

    body('description').trim().escape().customSanitizer(convertToArrayOfParagraphs),

    body('baseprice', 'Base price cannot be below £0.00').isFloat({ min: 0 }),

    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const oldModel = await Model.findById(req.params.id).exec();
        const errors = validationResult(req);

        const [selectedInstrument, selectedManufacturer, instrumentTypes, manufacturers] =
            await Promise.all([
                Instrument.findOne({ name: req.body.instrument }),
                Manufacturer.findOne({ name: req.body.manufacturer }),
                Instrument.find().sort({ name: 1 }).exec(),
                Manufacturer.find().sort({ name: 1 }).exec(),
            ]);

        const model = new Model({
            _id: req.params.id,
            instrument: selectedInstrument?._id,
            manufacturer: selectedManufacturer?._id,
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

        const duplicateModel = await Model.findOne({
            instrument: selectedInstrument?._id,
            manufacturer: selectedManufacturer?._id,
            name: req.body.name,
        })
            .collation({ locale: 'en', strength: 1 })
            .exec();

        if (duplicateModel) {
            res.render('forms/model_form', {
                page: `Edit ${oldModel!.name}`,
                formTitle: `Edit ${oldModel!.name}`,
                model: model,
                instrumentTypes: instrumentTypes,
                manufacturers: manufacturers,
                errors: [
                    {
                        msg: 'Model already exists with that name, please pick another.',
                    },
                ],
            });
        } else {
            const updatedModel = await Model.findByIdAndUpdate(req.params.id, model, {});
            res.redirect(updatedModel!.url);
        }
    }),
];

async function invalidateIfExistingInstrumentType(instrumentName: string): Promise<void> {
    const existingInstrument = await Instrument.findOne({ name: instrumentName });
    if (!existingInstrument) {
        throw new Error(
            'Selected instrument does not exist! Please select from the list of existing instrument types.'
        );
    }
}

async function invalidateIfExistingManufacturer(manufacturerName: string): Promise<void> {
    const existingManufacturer = await Manufacturer.findOne({ name: manufacturerName });
    if (!existingManufacturer) {
        throw new Error(
            'Selected manufacturer does not exist! Please select from the list of existing manufacturers.'
        );
    }
}

function convertToArrayOfParagraphs(text: string): string[] | undefined {
    // Only converts if description is present - empty string will return
    // undefined so the document does omits the description field
    const textWithSingleLineBreaks = text.replaceAll('\r', '').replaceAll(/\n+/g, '\n');
    return text === '' ? undefined : textWithSingleLineBreaks.split('\n');
}
