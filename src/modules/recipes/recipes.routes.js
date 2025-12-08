import { Router } from 'express';
import { verifyJWTToken } from '../../middlewares/auth.middleware.js';
import {
  createBasicInfo,
  createIngredientsAndSteps,
  createMedia,
  deleteRecipe,
  getAllRecipes,
  getRecipeById,
  reviewAndPostRecipe,
  updateRecipe,
} from './recipes.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';

const RecipeRouter = Router();

RecipeRouter.post('/basic-info', verifyJWTToken, createBasicInfo);
RecipeRouter.post('/media/:recipeId', verifyJWTToken, upload.single('recipe_photo'), createMedia);
RecipeRouter.post('/ingredients-and-steps/:recipeId', verifyJWTToken, createIngredientsAndSteps);
RecipeRouter.post('/review/:recipeId', verifyJWTToken, reviewAndPostRecipe);
RecipeRouter.get('', getAllRecipes);
RecipeRouter.get('/:recipeId', verifyJWTToken, getRecipeById);
RecipeRouter.patch('/edit-recipe/:recipeId', verifyJWTToken, upload.single('recipe_photo'), updateRecipe);
RecipeRouter.delete('/:recipeId', verifyJWTToken, deleteRecipe);

export default RecipeRouter;
