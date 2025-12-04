import { Router } from 'express';
import { verifyJWTToken } from '../../middlewares/auth.middleware.js';
import { createBasicInfo, createIngredientsAndSteps, createMedia, getAllRecipes, getRecipeById, reviewAndPostRecipe } from './recipes.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';

const RecipeRouter = Router();

RecipeRouter.post('/basic-info', verifyJWTToken, createBasicInfo);
RecipeRouter.post('/media/:recipeId', verifyJWTToken, upload.single('recipe_photo'), createMedia);
RecipeRouter.post('/ingredients-and-steps/:recipeId', verifyJWTToken, createIngredientsAndSteps);
RecipeRouter.post('/review/:recipeId', verifyJWTToken, reviewAndPostRecipe);
RecipeRouter.get('', getAllRecipes);
RecipeRouter.get('/:recipeId', verifyJWTToken, getRecipeById);

export default RecipeRouter;
