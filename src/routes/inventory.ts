import * as instrumentController from '../controllers/instrument_controller';
import * as manufacturerController from '../controllers/manufacturer_controller';
import * as modelController from '../controllers/model_controller';
import * as modelInstanceController from '../controllers/modelinstance_controller';

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

// GET form for creating new instrument type
// ! Must be above :id else `create` will be an
// ! invalid ObjectID and result in a 404
inventoryRouter.get('/instruments/create', instrumentController.instrumentForm_get);

// POST form - create new instrument in database
inventoryRouter.post('/instruments/create', instrumentController.createNewInstrument);

// GET individual instrument detail page
inventoryRouter.get('/instruments/:id', instrumentController.instrumentDetail_get);

// Handle deleting instrument type
// No POST as deletion triggered by GET only if elligible
// Rejected deletions return an error message
inventoryRouter.get('/instruments/:id/delete', instrumentController.deleteInstrument);

// GET form for editing instrument type
inventoryRouter.get('/instruments/:id/update', instrumentController.updateInstrument_get);

// POST form for editing instrument type
inventoryRouter.post('/instruments/:id/update', instrumentController.updateInstrument_post);

/*
    - Manufacturers
*/

// GET list of all manufacturers
inventoryRouter.get('/manufacturers', manufacturerController.allManufacturers_get);

// GET form for creating new manufacturer
// ! Must be above :id else `create` will be an
// ! invalid ObjectID and result in a 404
inventoryRouter.get('/manufacturers/create', manufacturerController.manufacturerForm_get);

// POST form - create new instrument in database
inventoryRouter.post('/manufacturers/create', manufacturerController.createNewManufacturer);

// GET list of all in stock instruments from manufacturer
inventoryRouter.get('/manufacturers/:id', manufacturerController.manufacturerDetail_get);

// Handle deleting manufacturer
// No POST as deletion triggered by GET only if elligible
// Rejected deletions return an error message
inventoryRouter.get('/manufacturers/:id/delete', manufacturerController.deleteManufacturer);

// GET form for editing manufacturer
inventoryRouter.get('/manufacturers/:id/update', manufacturerController.updateManufacturer_get);

// POST form for editing manufacturer
inventoryRouter.post('/manufacturers/:id/update', manufacturerController.updateManufacturer_post);

/*
    - Models
*/

// GET list of all models
inventoryRouter.get('/models', modelController.allModels_get);

// GET form for creating new model
// ! Must be above :id else `create` will be an
// ! invalid ObjectID and result in a 404
inventoryRouter.get('/models/create', modelController.modelForm_get);

// POST form - create new instrument model in database
inventoryRouter.post('/models/create', modelController.createNewModel);

// GET list of all in stock instruments of model
inventoryRouter.get('/models/:id', modelController.modelDetail_get);

// Handle deleting model
// No POST as deletion triggered by GET only if elligible
// Rejected deletions return an error message
inventoryRouter.get('/models/:id/delete', modelController.deleteModel);

// GET form for editing model
inventoryRouter.get('/models/:id/update', modelController.updateModel_get);

// POST form for editing model
inventoryRouter.post('/models/:id/update', modelController.updateModel_post);

/*
    - Model Instances
*/

// GET form for adding instrument instance to stock
inventoryRouter.get('/addstock', modelInstanceController.instanceForm_get);

// POST submitting new stock form
inventoryRouter.post('/addstock', modelInstanceController.instanceForm_post);

// GET indivial insstrument instance details page
inventoryRouter.get('/instock/:id', modelInstanceController.instanceDetails_get);

// Handle removing instance from stock
inventoryRouter.get('/instock/:id/delete', modelInstanceController.removeFromStock);

// GET form for editing model
inventoryRouter.get('/instock/:id/update', modelInstanceController.updateInstance_get);

// POST form for editing model
inventoryRouter.post('/instock/:id/update', modelInstanceController.updateInstance_post);
