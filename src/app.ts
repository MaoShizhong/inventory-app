import express, { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { indexRouter } from './routes/index';
import { inventoryRouter } from './routes/inventory';

declare global {
    interface Error {
        status?: number;
    }
}

const app = express();

// Set up mongoose connection
dotenv.config();
mongoose.set('strictQuery', false);

const main = async () => await mongoose.connect(process.env.CONNECTION_STRING!);
main().catch((err): void => console.error(err));

// view engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/inventory', inventoryRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction): void => {
    next(createError(404));
});

// error handler
app.use((err: Error, req: Request, res: Response): void => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

['SIGINT', 'exit'].forEach((exitEvent): void => {
    process.on(exitEvent, (): void => {
        mongoose.connection.close();
    });
});

module.exports = app;
