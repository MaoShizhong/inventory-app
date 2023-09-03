"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const inventory_controller_1 = require("../controllers/inventory_controller");
const express_1 = require("express");
exports.inventoryRouter = (0, express_1.Router)();
/* GET users listing. */
exports.inventoryRouter.get('/', inventory_controller_1.index);
