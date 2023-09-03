import * as instrumentController from '../controllers/instrument_controller';
// import * as manufacturerController from '../controllers/manufacturer_controller';
// import * as modelController from '../controllers/model_controller';
// import * as modelInstanceController from '../controllers/modelinstance_controller';

import { index } from '../controllers/inventory_controller';
import { Router } from 'express';

export const inventoryRouter = Router();

// Home
inventoryRouter.get('/', index);

/*
    [] Instruments
*/

// GET list of all instrument types
inventoryRouter.get('/instruments', instrumentController.allInstruments_Get);

/* 
    [] Manufacturers
*/

/*
    [] Models
*/

/* 
    [] Model Instances
*/
