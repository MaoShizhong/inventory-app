import express, { Request, Response } from 'express';

export const usersRouter = express.Router();

/* GET users listing. */
usersRouter.get('/', (req: Request, res: Response): void => {
    res.send('respond with a resource');
});
