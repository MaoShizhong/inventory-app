import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Model } from '../models/model';
import { ModelInstance } from '../models/model_instance';
import { Types } from 'mongoose';
import { Instrument } from '../models/instrument';

// List all instrument types
export const allModels_get = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const [allModels, allInstrumentTypes] = await Promise.all([
        Model.find().populate('instrument').exec(),
        Instrument.find().exec(),
    ]);

    res.render('models/all_models', {
        allModels: allModels,
        instrumentTypes: allInstrumentTypes,
    });
});

// Get list of all instruments in stock for that type
export const modelDetail_get = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!Types.ObjectId.isValid(req.params.id)) {
        return res.render('404', { request: 'Instrument model' });
    }

    // Fetch instrument and models of that instrument (models for use in instance search later)
    const model = await Model.findById(req.params.id).populate('instrument').exec();

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

    res.render('models/model_detail', {
        model: model,
        instrumentsInStock: instrumentsInStock,
    });
});
