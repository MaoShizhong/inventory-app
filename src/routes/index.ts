import express, { Request, Response } from 'express';

export const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', (req: Request, res: Response): void => {
    res.render('index', { title: 'Express' });
});
