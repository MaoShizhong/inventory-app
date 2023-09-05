import { Instrument } from '../models/instrument';
import { ModelInstance } from '../models/model_instance';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const index = asyncHandler(async (req: Request, res: Response) => {
    // Get details of books, book instances, authors and genre counts (in parallel)
    const [inStockCount, instrumentTypeCount] = await Promise.all([
        ModelInstance.countDocuments({}).exec(),
        Instrument.countDocuments({}).exec(),
    ]);

    res.render('index', {
        title: 'Inventory',
        inStockCount: inStockCount,
        instrumentTypeCount: instrumentTypeCount,
    });
});
