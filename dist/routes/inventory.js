"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const instrumentController = __importStar(require("../controllers/instrument_controller"));
const manufacturerController = __importStar(require("../controllers/manufacturer_controller"));
const modelController = __importStar(require("../controllers/model_controller"));
const modelInstanceController = __importStar(require("../controllers/modelinstance_controller"));
const inventory_controller_1 = require("../controllers/inventory_controller");
const express_1 = require("express");
exports.inventoryRouter = (0, express_1.Router)();
// Home
exports.inventoryRouter.get('/', inventory_controller_1.index);
/*
    - Instruments
*/
// GET list of all instrument types
exports.inventoryRouter.get('/instruments', instrumentController.allInstruments_get);
// GET form for creating new instrument type
// ! Must be above :id else `create` will be an
// ! invalid ObjectID and result in a 404
exports.inventoryRouter.get('/instruments/create', instrumentController.instrumentForm_get);
// POST form - create new instrument in database
exports.inventoryRouter.post('/instruments/create', instrumentController.createNewInstrument);
// GET individual instrument detail page
exports.inventoryRouter.get('/instruments/:id', instrumentController.instrumentDetail_get);
// Handle deleting instrument type
// No POST as deletion triggered by GET only if elligible
// Rejected deletions return an error message
exports.inventoryRouter.get('/instruments/:id/delete', instrumentController.deleteInstrument);
// GET form for editing instrument type
exports.inventoryRouter.get('/instruments/:id/update', instrumentController.updateInstrument_get);
// POST form for editing instrument type
exports.inventoryRouter.post('/instruments/:id/update', instrumentController.updateInstrument_post);
/*
    - Manufacturers
*/
// GET list of all manufacturers
exports.inventoryRouter.get('/manufacturers', manufacturerController.allManufacturers_get);
// GET form for creating new manufacturer
// ! Must be above :id else `create` will be an
// ! invalid ObjectID and result in a 404
exports.inventoryRouter.get('/manufacturers/create', manufacturerController.manufacturerForm_get);
// POST form - create new instrument in database
exports.inventoryRouter.post('/manufacturers/create', manufacturerController.createNewManufacturer);
// GET list of all in stock instruments from manufacturer
exports.inventoryRouter.get('/manufacturers/:id', manufacturerController.manufacturerDetail_get);
// Handle deleting manufacturer
// No POST as deletion triggered by GET only if elligible
// Rejected deletions return an error message
exports.inventoryRouter.get('/manufacturers/:id/delete', manufacturerController.deleteManufacturer);
// GET form for editing manufacturer
exports.inventoryRouter.get('/manufacturers/:id/update', manufacturerController.updateManufacturer_get);
// POST form for editing manufacturer
exports.inventoryRouter.post('/manufacturers/:id/update', manufacturerController.updateManufacturer_post);
/*
    - Models
*/
// GET list of all models
exports.inventoryRouter.get('/models', modelController.allModels_get);
// GET form for creating new model
// ! Must be above :id else `create` will be an
// ! invalid ObjectID and result in a 404
exports.inventoryRouter.get('/models/create', modelController.modelForm_get);
// POST form - create new instrument model in database
exports.inventoryRouter.post('/models/create', modelController.createNewModel);
// GET list of all in stock instruments of model
exports.inventoryRouter.get('/models/:id', modelController.modelDetail_get);
// Handle deleting model
// No POST as deletion triggered by GET only if elligible
// Rejected deletions return an error message
exports.inventoryRouter.get('/models/:id/delete', modelController.deleteModel);
// GET form for editing model
exports.inventoryRouter.get('/models/:id/update', modelController.updateModel_get);
// POST form for editing model
exports.inventoryRouter.post('/models/:id/update', modelController.updateModel_post);
/*
    - Model Instances
*/
// GET form for adding instrument instance to stock
exports.inventoryRouter.get('/addstock', modelInstanceController.instanceForm_get);
// POST submitting new stock form
exports.inventoryRouter.post('/addstock', modelInstanceController.instanceForm_post);
// GET indivial insstrument instance details page
exports.inventoryRouter.get('/instock/:id', modelInstanceController.instanceDetails_get);
// Handle removing instance from stock
exports.inventoryRouter.get('/instock/:id/delete', modelInstanceController.removeFromStock);
// GET form for editing model
exports.inventoryRouter.get('/instock/:id/update', modelInstanceController.updateInstance_get);
// POST form for editing model
exports.inventoryRouter.post('/instock/:id/update', modelInstanceController.updateInstance_post);
