import { index } from '../controllers/inventory_controller';
import { Router } from 'express';

export const inventoryRouter = Router();

/* GET users listing. */
inventoryRouter.get('/', index);
