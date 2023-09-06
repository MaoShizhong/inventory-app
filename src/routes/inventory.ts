import * as instrumentController from '../controllers/instrument_controller';
import * as manufacturerController from '../controllers/manufacturer_controller';
import * as modelController from '../controllers/model_controller';
// import * as modelInstanceController from '../controllers/modelinstance_controller';

import { index } from '../controllers/inventory_controller';
import { Router } from 'express';

export const inventoryRouter = Router();

// Home
inventoryRouter.get('/', index);

/*
    - Instruments
*/

// GET list of all instrument types
inventoryRouter.get('/instruments', instrumentController.allInstruments_get);

// GET individual instrument detail page
inventoryRouter.get('/instruments/:id', instrumentController.instrumentDetail_get);

/* 
    - Manufacturers
*/

// GET list of all manufacturers
inventoryRouter.get('/manufacturers', manufacturerController.allManufacturers_get);

// GET list of all in stock instruments from manufacturer
inventoryRouter.get('/manufacturers/:id', manufacturerController.manufacturerDetail_get);

/*
    - Models
*/

// GET list of all models
inventoryRouter.get('/models', modelController.allModels_get);

// GET list of all in stock instruments of model
inventoryRouter.get('/models/:id', modelController.modelDetail_get);

/* 
    - Model Instances
*/
