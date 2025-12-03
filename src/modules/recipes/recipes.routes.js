import { Router } from 'express';
import { verifyJWTToken } from '../../middlewares/auth.middleware.js';
import { createBasicInfo, createMedia } from './recipes.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';

const RecipeRouter = Router();

RecipeRouter.post('/basic-info', verifyJWTToken, createBasicInfo);
RecipeRouter.post('/media/:recipeId', verifyJWTToken, upload.single('recipe_photo'), createMedia);

export default RecipeRouter;
