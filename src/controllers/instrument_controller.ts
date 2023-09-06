import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Instrument } from '../models/instrument';
import { Model } from '../models/model';
import { ModelInstance } from '../models/model_instance';
import { Types } from 'mongoose';

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

// Get list of all instruments in stock for that type
export const instrumentDetail_get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (!Types.ObjectId.isValid(req.params.id)) {
            return res.render('404', { request: 'Instrument type' });
        }

        // Fetch instrument and models of that instrument (models for use in instance search later)
        const [instrument, modelsInStock] = await Promise.all([
            Instrument.findById(req.params.id).exec(),
            Model.find({ instrument: req.params.id }).exec(),
        ]);

        if (!instrument) {
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

        res.render('instruments/instrument_detail', {
            title: instrument.type,
            instrumentsInStock: instrumentsInStock,
        });
    }
);
