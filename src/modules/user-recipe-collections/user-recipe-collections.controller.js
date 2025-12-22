import { StatusCodes } from 'http-status-codes';
import { generatePublicId } from '../../common/functions.common.js';
import { RECIPE, USERRECIPECOLLECTION } from '../../common/global.common.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { Recipe } from '../recipes/recipes.model.js';
import { UserRecipeCollection } from './user-recipe-collections.model.js';

//create collection
export const createUserRecipeCollection = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { name, recipes = [] } = req.body;

  if (!name)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USERRECIPECOLLECTION.NAME_REQUIRED, true));

  // check collection exist or not
  const userRecipeCollectionExist = await UserRecipeCollection.findOne({ user_id: userId, name, is_deleted: false }).lean();
  console.log('collection: ', userRecipeCollectionExist);

  if (userRecipeCollectionExist)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USERRECIPECOLLECTION.ALREADY_EXIST, true));

  const userRecipeCollectionId = generatePublicId();

  //create collection
  const newCollection = await UserRecipeCollection.create({
    user_recipe_collection_id: userRecipeCollectionId,
    user_id: userId,
    name,
    recipes,
    created_at: Date.now(),
  });

  console.log('new collection: ', newCollection);

  //return respond
  return res
    .status(StatusCodes.CREATED)
    .send(responseGenerators({ new_collection: newCollection }, StatusCodes.CREATED, USERRECIPECOLLECTION.CREATED, false));
});

// add recipe in particular collection
export const addRecipesToCollection = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { userRecipeCollectionId } = req.params;
  const { recipe_id } = req.body;

  if (!recipe_id)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USERRECIPECOLLECTION.RECIPE_ID_REQUIRED, true));

  // check collection exist or not
  const userRecipeCollectionExist = await UserRecipeCollection.findOne({
    user_recipe_collection_id: userRecipeCollectionId,
    user_id: userId,
    is_deleted: false,
  });

  if (!userRecipeCollectionExist)
    return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USERRECIPECOLLECTION.NOT_FOUND, true));

  // check recipe exist or not
  const recipeExist = await Recipe.findOne({ recipe_id, status: 'posted', is_deleted: false });

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  //check if recipe is already in collection
  if (userRecipeCollectionExist.recipes.includes(recipe_id)) {
    return res.status(StatusCodes.CONFLICT).send(responseGenerators({}, StatusCodes.CONFLICT, USERRECIPECOLLECTION.RECIPE_ALREADY_EXIST, true));
  }

  //update recipe while adding
  await UserRecipeCollection.updateOne(
    {
      user_recipe_collection_id: userRecipeCollectionId,
    },
    {
      $addToSet: { recipes: recipe_id },
      $set: { updated_at: Date.now(), updated_by: userId },
    }
  );

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, USERRECIPECOLLECTION.RECIPE_ADDED, false));
});

//remove recipe from collection -> collection id and recipe id
export const removeRecipesFromCollection = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { userRecipeCollectionId, recipeId } = req.params;

  // check collection exist or not
  const userRecipeCollectionExist = await UserRecipeCollection.findOne({
    user_recipe_collection_id: userRecipeCollectionId,
    user_id: userId,
    is_deleted: false,
  });

  if (!userRecipeCollectionExist)
    return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USERRECIPECOLLECTION.NOT_FOUND, true));

  // check recipe exist or not
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, status: 'posted', is_deleted: false });

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  //check if recipe is not in collection
  if (!userRecipeCollectionExist.recipes.includes(recipeId)) {
    return res.status(StatusCodes.CONFLICT).send(responseGenerators({}, StatusCodes.CONFLICT, USERRECIPECOLLECTION.RECIPE_NOT_FOUND, true));
  }

  //update recipe while removing
  await UserRecipeCollection.updateOne(
    {
      user_recipe_collection_id: userRecipeCollectionId,
    },
    {
      $pull: { recipes: recipeId },
      $set: { updated_at: Date.now(), updated_by: userId },
    }
  );

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, USERRECIPECOLLECTION.RECIPE_DELETED, false));
});

//get all user-recipe-collection
export const getAllUserRecipeCollections = asyncHandler(async (req, res) => {
  //get all user-recipe-collection
  const userRecipeCollections = await UserRecipeCollection.find({ is_deleted: false }).lean();

  //return respond
  return res
    .status(StatusCodes.OK)
    .send(responseGenerators({ user_recipe_collections: userRecipeCollections }, StatusCodes.OK, USERRECIPECOLLECTION.FETCHED, false));
});

//get user-recipe-collection by id
export const getUserRecipeCollectionById = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { userRecipeCollectionId } = req.params;

  //get user-recipe-collection
  const userRecipeCollection = await UserRecipeCollection.findOne({
    user_recipe_collection_id: userRecipeCollectionId,
    user_id: userId,
    is_deleted: false,
  }).lean();

  if (!userRecipeCollection)
    return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USERRECIPECOLLECTION.NOT_FOUND, true));

  //return respond
  return res
    .status(StatusCodes.OK)
    .send(responseGenerators({ user_recipe_collection: userRecipeCollection }, StatusCodes.OK, USERRECIPECOLLECTION.FETCHED, false));
});

//get all recipes of user in user-recipe-collection with recipes count
export const getAllRecipesOfUserInCollection = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { userRecipeCollectionId } = req.params;

  //get user-recipe-collection
  const userRecipeCollection = await UserRecipeCollection.findOne({
    user_recipe_collection_id: userRecipeCollectionId,
    user_id: userId,
    is_deleted: false,
  }).lean();

  if (!userRecipeCollection)
    return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USERRECIPECOLLECTION.NOT_FOUND, true));

  if (!userRecipeCollection.recipes.length)
    return res
      .status(StatusCodes.NOT_FOUND)
      .send(responseGenerators({ recipes: [], recipe_count: 0 }, StatusCodes.NOT_FOUND, USERRECIPECOLLECTION.RECIPE_NOT_FOUND, true));

  //get all recipes of user in user-recipe-collection
  const recipes = await Recipe.find(
    { recipe_id: { $in: userRecipeCollection.recipes }, status: 'posted', is_deleted: false },
    { recipe_id: 1, recipe_name: 1, likes: 1 }
  ).lean();

  //get recipe count
  const recipeCount = recipes.length;

  //return respond
  return res
    .status(StatusCodes.OK)
    .send(
      responseGenerators(
        { user_recipe_collection: userRecipeCollection, recipes, recipe_count: recipeCount },
        StatusCodes.OK,
        USERRECIPECOLLECTION.RECIPES_FETCHED,
        false
      )
    );
});

//update user-recipe-collection by id
export const updateUserRecipeCollection = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { userRecipeCollectionId } = req.params;

  //get user-recipe-collection
  const userRecipeCollection = await UserRecipeCollection.findOne({
    user_recipe_collection_id: userRecipeCollectionId,
    user_id: userId,
    is_deleted: false,
  });

  if (!userRecipeCollection)
    return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USERRECIPECOLLECTION.NOT_FOUND, true));

  //update user-recipe-collection
  await UserRecipeCollection.updateOne(
    { user_recipe_collection_id: userRecipeCollectionId },
    { $set: { ...req.body, updated_at: Date.now(), updated_by: userId } },
    { new: true }
  );

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, USERRECIPECOLLECTION.UPDATED, false));
});

//delete user-recipe-collection by id
export const deleteUserRecipeCollection = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { userRecipeCollectionId } = req.params;

  //get user-recipe-collection
  const userRecipeCollection = await UserRecipeCollection.findOne({
    user_recipe_collection_id: userRecipeCollectionId,
    user_id: userId,
    is_deleted: false,
  });

  if (!userRecipeCollection)
    return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USERRECIPECOLLECTION.NOT_FOUND, true));

  //delete user-recipe-collection
  await UserRecipeCollection.updateOne(
    { user_recipe_collection_id: userRecipeCollectionId, is_deleted: false },
    { $set: { is_deleted: true, deleted_at: Date.now(), deleted_by: userId } }
  );

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, USERRECIPECOLLECTION.DELETED, false));
});
