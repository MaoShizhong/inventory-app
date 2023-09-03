import { Router as expressRouter, Request, Response } from 'express';

export const indexRouter = expressRouter();

/* GET home page. */
indexRouter.get('/', (req: Request, res: Response): void => {
    res.redirect('/inventory');
});
