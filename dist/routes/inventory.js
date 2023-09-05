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
// import * as manufacturerController from '../controllers/manufacturer_controller';
// import * as modelController from '../controllers/model_controller';
// import * as modelInstanceController from '../controllers/modelinstance_controller';
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
// GET individual instrument detail page
exports.inventoryRouter.get('/instruments/:id', instrumentController.instrumentDetail_get);
/*
    - Manufacturers
*/
/*
    - Models
*/
/*
    - Model Instances
*/
