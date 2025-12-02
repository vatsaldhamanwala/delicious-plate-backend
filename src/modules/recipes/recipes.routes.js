import { Router } from 'express';
import { verifyJWTToken } from '../../middlewares/auth.middleware.js';
import { createBasicInfo } from './recipes.controller.js';

const RecipeRouter = Router();

RecipeRouter.post('/basic-info', verifyJWTToken, createBasicInfo);

export default RecipeRouter;
