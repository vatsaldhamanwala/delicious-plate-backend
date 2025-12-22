import { Router } from 'express';
import { addRecipesToCollection, createUserRecipeCollection, deleteUserRecipeCollection, getAllRecipesOfUserInCollection, getAllUserRecipeCollections, getUserRecipeCollectionById, removeRecipesFromCollection, updateUserRecipeCollection } from './user-recipe-collections.controller.js';
import { verifyJWTToken } from '../../middlewares/auth.middleware.js';

const UserRecipeCollectionRouter = Router();

UserRecipeCollectionRouter.post('/', verifyJWTToken, createUserRecipeCollection);
UserRecipeCollectionRouter.post('/:userRecipeCollectionId/recipes', verifyJWTToken, addRecipesToCollection);
UserRecipeCollectionRouter.delete('/:userRecipeCollectionId/recipes/:recipeId', verifyJWTToken, removeRecipesFromCollection);
UserRecipeCollectionRouter.get('/', getAllUserRecipeCollections);
UserRecipeCollectionRouter.get('/:userRecipeCollectionId', verifyJWTToken, getUserRecipeCollectionById);
UserRecipeCollectionRouter.get('/:userRecipeCollectionId/recipes', verifyJWTToken, getAllRecipesOfUserInCollection);
UserRecipeCollectionRouter.put('/:userRecipeCollectionId', verifyJWTToken, updateUserRecipeCollection);
UserRecipeCollectionRouter.delete('/:userRecipeCollectionId', verifyJWTToken, deleteUserRecipeCollection);


export default UserRecipeCollectionRouter;