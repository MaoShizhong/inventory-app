import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Instrument } from '../models/instrument';

export const allInstruments_Get = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const allInstruments = await Instrument.find().exec();

        res.render('instruments/all_instrument_types', {
            title: 'All Instrument Types:',
            allInstruments: allInstruments,
        });
    }
);
