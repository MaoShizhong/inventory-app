import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Model } from '../models/model';
import { ModelInstance } from '../models/model_instance';
import { Types } from 'mongoose';
import { Manufacturer } from '../models/manufacturer';

// List all instrument types
export const allManufacturers_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const allManufacturers = await Manufacturer.find().exec();

        res.render('manufacturers/all_manufacturers', {
            title: 'All Manufacturers:',
            allManufacturers: allManufacturers,
        });
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

        res.render('manufacturers/manufacturer_detail', {
            title: manufacturer.name,
            instrumentsInStock: instrumentsInStock,
        });
    }
);
