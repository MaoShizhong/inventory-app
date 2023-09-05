import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Instrument } from '../models/instrument';
import { Model } from '../models/model';
import { ModelInstance } from '../models/model_instance';

// List all instrument types
export const allInstruments_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const allInstruments = await Instrument.find().exec();

        res.render('instruments/all_instrument_types', {
            title: 'All Instrument Types:',
            allInstruments: allInstruments,
        });
    }
);

// Get instrument details page containing list of in-stock instances
export const instrumentDetail_get = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Fetch instrument and models of that instrument (models for use in instance search later)
        const [instrument, modelsInStock] = await Promise.all([
            Instrument.findById(req.params.id).exec(),
            Model.find({ instrument: req.params.id }).exec(),
        ]);

        if (!instrument) {
            const err = new Error('Instrument type not found!');
            err.status = 404;
            return next(err);
        }

        // Can only search for model instances after first retrieving the right models as above
        const instrumentsInStock = await ModelInstance.find({
            model: { $in: modelsInStock },
        })
            .populate({
                path: 'model',
                populate: {
                    path: 'manufacturer',
                },
            })
            .exec();

        res.render('instruments/instrument_detail', {
            title: instrument.type,
            instrumentsInStock: instrumentsInStock,
        });
    }
);
