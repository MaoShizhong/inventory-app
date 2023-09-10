import { Request, RequestHandler, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ValidationChain, body, validationResult } from 'express-validator';
import { Instrument } from '../models/instrument';
import { Model } from '../models/model';
import { ModelInstance } from '../models/model_instance';
import { Types } from 'mongoose';

declare global {
    type FormPOSTHandler = (ValidationChain | RequestHandler)[];
}

// List all instrument types
export const allInstruments_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const allInstruments = await Instrument.find().sort({ name: 1 }).exec();

        res.render('list_all', {
            currentPath: 'instruments',
            categoryName: 'Instrument Type',
            categoryEntries: allInstruments,
        });
    }
);

// Form for adding an instrument type
export const instrumentForm_get = (req: Request, res: Response): void => {
    res.render('forms/instrument_form', {
        formTitle: 'Add instrument type',
    });
};

// Submitting the "add instrument type" form
export const createNewInstrument: FormPOSTHandler = [
    body('name', 'Instrument name cannot be empty').trim().notEmpty().escape(),

    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);

        const newInstrument = new Instrument({ name: req.body.name });

        if (!errors.isEmpty()) {
            res.render('forms/instrument_form', {
                instrument: newInstrument,
                errors: errors.array(),
            });
        } else {
            const existingInstrument = await Instrument.findOne({ name: req.body.name })
                .collation({ locale: 'en', strength: 1 })
                .exec();

            if (existingInstrument) {
                res.redirect(existingInstrument.url);
            } else {
                await newInstrument.save();
                res.redirect(newInstrument.url);
            }
        }
    }),
];

// Get list of all instruments in stock for that type
export const instrumentDetail_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!Types.ObjectId.isValid(req.params.id)) {
            return res.render('404', { request: 'Instrument type' });
        }

        // Fetch instrument and models of that instrument (models for use in instance search later)
        const [instrumentType, modelsInStock] = await Promise.all([
            Instrument.findById(req.params.id).exec(),
            Model.find({ instrument: req.params.id }).exec(),
        ]);

        if (!instrumentType) {
            return res.render('404', { request: 'Instrument type' });
        }

        // Can only search for model instances after first retrieving the right models as above
        const instrumentsInStock = await ModelInstance.find({ model: { $in: modelsInStock } })
            .populate({
                path: 'model',
                populate: {
                    path: 'manufacturer',
                },
            })
            .exec();

        res.render('details', {
            isInstrumentPage: true,
            category: instrumentType,
            editBtnText: 'Name',
            deleteBtnText: 'Instrument',
            instrumentsInStock: instrumentsInStock,
        });
    }
);

// Handle instrument deletion - will only be successful if no instock models using it
export const deleteInstrument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const [instrumentType, modelsUsingInstrument] = await Promise.all([
        Instrument.findById(req.params.id).exec(),
        Model.find({ instrument: req.params.id }).exec(),
    ]);

    if (!instrumentType) {
        res.redirect('/inventory/instruments');
    } else if (modelsUsingInstrument.length) {
        // Prevent deletion if any models exist that use the instrument type
        // Return to instrument detail page with error message showing

        const instrumentsInStock = await ModelInstance.find({
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

            category: instrumentType,
            editBtnText: 'Name',
            deleteBtnText: 'Instrument',
            instrumentsInStock: instrumentsInStock,
        });
    } else {
        // Delete only if no models in stock of this instrument type
        await Instrument.findByIdAndRemove(instrumentType._id);
        res.redirect('/inventory/instruments');
    }
});

// Form for editing instrument type name
export const updateInstrument_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        // Custom 404 page if URL ID field is not a valid ObjectID shape
        if (!Types.ObjectId.isValid(req.params.id)) {
            return res.render('404', { request: 'Instrument type' });
        }

        const instrument = await Instrument.findById(req.params.id).exec();

        // Custom 404 page
        if (!instrument) {
            return res.render('404', { request: 'Instrument type' });
        }

        res.render('forms/instrument_form', {
            formTitle: `Edit ${instrument.name}`,
            instrument: instrument,
        });
    }
);

// Submitting new instrument type name - only possible if name isn't already taken
export const updateInstrument_post: FormPOSTHandler = [
    body('name', 'Instrument name cannot be empty').trim().notEmpty().escape(),

    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const oldInstrument = await Instrument.findById(req.params.id).exec();
        const errors = validationResult(req);

        const instrument = new Instrument({
            _id: req.params.id,
            name: req.body.name,
        });

        if (!errors.isEmpty()) {
            res.render('forms/instrument_form', {
                formTitle: `Edit ${oldInstrument!.name}`,
                instrument: instrument,
                errors: errors.array(),
            });
        }

        const instrumentExists = await Instrument.findOne({ name: req.body.name })
            .collation({ locale: 'en', strength: 1 })
            .exec();

        if (instrumentExists) {
            res.render('forms/instrument_form', {
                formTitle: `Edit ${oldInstrument!.name}`,
                instrument: instrument,
                errors: [
                    {
                        msg: 'Instrument type already exists with that name, please pick another.',
                    },
                ],
            });
        } else {
            const updatedInstrument = await Instrument.findByIdAndUpdate(
                req.params.id,
                instrument,
                {}
            );
            res.redirect(updatedInstrument!.url);
        }
    }),
];
