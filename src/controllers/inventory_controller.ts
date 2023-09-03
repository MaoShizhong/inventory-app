import { Instrument } from '../models/instrument';
import { Model } from '../models/model';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const index = asyncHandler(async (req: Request, res: Response) => {
    // Get details of books, book instances, authors and genre counts (in parallel)
    const [instrumentCount, instrumentTypeCount] = await Promise.all([
        Model.countDocuments({}).exec(),
        Instrument.countDocuments({}).exec(),
    ]);

    res.render('index', {
        title: 'Inventory',
        instrumentCount: instrumentCount,
        instrumentTypeCount: instrumentTypeCount,
    });
});
