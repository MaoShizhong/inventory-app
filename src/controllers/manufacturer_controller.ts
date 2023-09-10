import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { Model } from '../models/model';
import { ModelInstance } from '../models/model_instance';
import { Types } from 'mongoose';
import { Manufacturer } from '../models/manufacturer';

// List all instrument types
export const allManufacturers_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const allManufacturers = await Manufacturer.find().sort({ name: 1 }).exec();

        res.render('list_all', {
            currentPath: 'manufacturers',
            categoryName: 'Manufacturer',
            categoryEntries: allManufacturers,
        });
    }
);

// Form for adding a manufacturer
export const manufacturerForm_get = (req: Request, res: Response): void => {
    res.render('forms/manufacturer_form', {
        formTitle: 'Add manufacturer',
    });
};

// Submitting the "add manufacturer" form
export const createNewManufacturer: FormPOSTHandler = [
    body('name', 'Manufacturer name cannot be empty').trim().notEmpty().escape(),

    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);

        const newManufacturer = new Manufacturer({ name: req.body.name });

        if (!errors.isEmpty()) {
            res.render('forms/manufacturer_form', {
                instrument: newManufacturer,
                errors: errors.array(),
            });
        } else {
            const existingManufacturer = await Manufacturer.findOne({ name: req.body.name })
                .collation({ locale: 'en', strength: 1 })
                .exec();

            if (existingManufacturer) {
                res.redirect(existingManufacturer.url);
            } else {
                await newManufacturer.save();
                res.redirect(newManufacturer.url);
            }
        }
    }),
];

// Handle manufacturer deletion - will only be successful if no instock models using it
export const deleteManufacturer = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const [manufacturer, modelsUsingManufacturer] = await Promise.all([
            Manufacturer.findById(req.params.id).exec(),
            Model.find({ manufacturer: req.params.id }).exec(),
        ]);

        if (!manufacturer) {
            res.redirect('/inventory/manufacturers');
        } else if (modelsUsingManufacturer.length) {
            // Prevent deletion if any models exist that use the instrument type
            // Return to instrument detail page with error message showing

            const instrumentsInStock = await ModelInstance.find({
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
        } else {
            // Delete only if no models in stock of this instrument type
            await Manufacturer.findByIdAndRemove(manufacturer._id);
            res.redirect('/inventory/manufacturers');
        }
    }
);

// Get list of all instruments in stock for that type
export const manufacturerDetail_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        /*
            Required here otherwise invalid ObjectID error is thrown during querying and
            before the following conditional can run.
        */
        if (!Types.ObjectId.isValid(req.params.id)) {
            return res.render('404', { request: 'Manufacturer' });
        }

        // Fetch instrument and models of that instrument (models for use in instance search later)
        const [manufacturer, modelsInStock] = await Promise.all([
            Manufacturer.findById(req.params.id).exec(),
            Model.find({ manufacturer: req.params.id }).exec(),
        ]);

        if (!manufacturer) {
            return res.render('404', { request: 'Manufacturer' });
        }

        // Can only search for model instances after first retrieving the right models as above
        const instrumentsInStock = await ModelInstance.find({ model: { $in: modelsInStock } })
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
    }
);

// Form for editing manufacturer name
export const updateManufacturer_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        // Custom 404 page if URL ID field is not a valid ObjectID shape
        if (!Types.ObjectId.isValid(req.params.id)) {
            return res.render('404', { request: 'Manufacturer' });
        }

        const manufacturer = await Manufacturer.findById(req.params.id).exec();

        // Custom 404 page
        if (!manufacturer) {
            return res.render('404', { request: 'Manufacturer' });
        }

        res.render('forms/manufacturer_form', {
            formTitle: `Edit ${manufacturer.name}`,
            manufacturer: manufacturer,
        });
    }
);

// Submitting new manufacturer name - only possible if name isn't already taken
export const updateManufacturer_post: FormPOSTHandler = [
    body('name', 'Manufacturer name cannot be empty').trim().notEmpty().escape(),

    asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const oldManufacturer = await Manufacturer.findById(req.params.id).exec();
        const errors = validationResult(req);

        const manufacturer = new Manufacturer({
            _id: req.params.id,
            name: req.body.name,
        });

        if (!errors.isEmpty()) {
            res.render('forms/manufacturer_form', {
                formTitle: `Edit ${oldManufacturer!.name}`,
                manufacturer: manufacturer,
                errors: errors.array(),
            });
        }

        const manufacturerExists = await Manufacturer.findOne({ name: req.body.name })
            .collation({ locale: 'en', strength: 1 })
            .exec();

        if (manufacturerExists) {
            res.render('forms/manufacturer_form', {
                formTitle: `Edit ${oldManufacturer!.name}`,
                manufacturer: manufacturer,
                errors: [
                    {
                        msg: 'Manufacturer already exists with that name, please pick another.',
                    },
                ],
            });
        } else {
            const updatedManufacturer = await Manufacturer.findByIdAndUpdate(
                req.params.id,
                manufacturer,
                {}
            );
            res.redirect(updatedManufacturer!.url);
        }
    }),
];
