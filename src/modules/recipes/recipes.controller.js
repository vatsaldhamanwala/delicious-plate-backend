import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../utils/async-handler.js';
import { RECIPE } from '../../common/global.common.js';
import { generatePublicId } from '../../common/functions.common.js';
import { Recipe } from './recipes.model.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { User } from '../users/users.model.js';
import { deleteOldFileFromCloudinary, uploadOnCloudinary } from '../../utils/cloudinary.js';

//create recipes in 4 steps --> step 1:- basic-info
export const createBasicInfo = asyncHandler(async (req, res) => {
  const { recipe_name, diet_preference, dish_type, meal_time, description } = req.body;

  if (!recipe_name?.trim() || !description?.trim() || diet_preference.length === 0 || dish_type.length === 0 || meal_time.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, RECIPE.ALL_FIELDS_ARE_REQUIRED, true));
  }

  const existingDraft = await Recipe.findOne({ user_id: req.user.user_id, status: 'draft' });

  if (existingDraft) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(responseGenerators({ recipe_id: existingDraft.recipe_id }, StatusCodes.BAD_REQUEST, RECIPE.DRAFT_RECIPE_ALREADY_EXIST, true));
  }

  const recipeId = generatePublicId();

  // create recipe
  const newRecipe = await Recipe.create({
    recipe_id: recipeId,
    user_id: req.user.user_id,
    recipe_name,
    diet_preference,
    dish_type,
    meal_time,
    description,
    status: 'draft',
    is_basic_info_step_completed: true,
    created_at: Date.now(),
  });

  //return respond
  return res.status(StatusCodes.CREATED).send(responseGenerators({ recipe: newRecipe }, StatusCodes.CREATED, RECIPE.CREATED, false));
});

//step-2:- media
export const createMedia = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, is_deleted: false }, { status: 'draft' });

  console.log('Recipe Exist: ', recipeExist);

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  //if recipe exist then upload recipe
  let recipePhoto = { url: '', public_id: '' };
  let recipePhotoLocalFile;

  if (req.file && req.file.path) {
    recipePhotoLocalFile = req.file.path;
  }

  if (!recipePhotoLocalFile)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, RECIPE.RECIPE_PHOTO_REQUIRED, true));

  const uploadedRecipePhoto = await uploadOnCloudinary(recipePhotoLocalFile);

  if (!recipePhoto)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, RECIPE.RECIPE_PHOTO_REQUIRED, true));

  if (uploadedRecipePhoto?.url && uploadedRecipePhoto.public_id) {
    recipePhoto = {
      url: uploadedRecipePhoto.url || '',
      public_id: uploadedRecipePhoto.public_id || '',
    };
  }

  if (!uploadedRecipePhoto)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, RECIPE.RECIPE_PHOTO_REQUIRED, true));

  await Recipe.updateOne(
    { recipe_id: recipeId },
    { $set: { recipe_photo: recipePhoto, is_media_step_completed: true, status: 'draft', updated_at: Date.now() } },
    { new: true }
  );

  //return respond
  return res.status(StatusCodes.CREATED).send(responseGenerators({}, StatusCodes.CREATED, RECIPE.CREATED, false));
});

//step-3:- ingredients-and-steps
export const createIngredientsAndSteps = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const { number_of_servings, ingredients_used, steps } = req.body;

  if (number_of_servings === 0 || ingredients_used.length === 0 || steps.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, RECIPE.ALL_FIELDS_ARE_REQUIRED, true));
  }

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, is_deleted: false }, { status: 'draft' });

  console.log('Recipe Exist: ', recipeExist);

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  await Recipe.updateOne(
    { recipe_id: recipeId },
    { $set: { number_of_servings, ingredients_used, steps, is_ingredients_and_steps_step_completed: true, status: 'draft', updated_at: Date.now() } },
    { new: true }
  );

  //return respond
  return res.status(StatusCodes.CREATED).send(responseGenerators({}, StatusCodes.CREATED, RECIPE.CREATED, false));
});

//step-4:- review/ posted
export const reviewAndPostRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, is_deleted: false }, { status: 'draft' });

  console.log('Recipe Exist: ', recipeExist);

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  //check all steps are previous steps are completed
  if (recipeExist.is_basic_info_step_completed || recipeExist.is_media_step_completed || recipeExist.is_ingredients_and_steps_step_completed)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, RECIPE.STEP_IS_INCOMPLETE, true));

  await Recipe.updateOne({ recipe_id: recipeId }, { $set: { status: 'posted', updated_at: Date.now() } }, { new: true });

  //pushing this recipe into users post field
  await User.updateOne({ user_id: req.user.user_id }, { $push: { post: recipeExist._id, updated_at: Date.now() } });

  //return respond
  return res.status(StatusCodes.CREATED).send(responseGenerators({}, StatusCodes.CREATED, RECIPE.POSTED, false));
});

//get recipes
export const getAllRecipes = asyncHandler(async (req, res) => {
  //find recipe
  const recipeExist = await Recipe.find({ is_deleted: false, status: 'posted' }, { _id: 0, __v: 0 });

  console.log('Recipe Exist: ', recipeExist);

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({ recipes: recipeExist }, StatusCodes.OK, RECIPE.FETCHED, false));
});

//get recipes by id
export const getRecipeById = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, is_deleted: false, status: 'posted' }, { _id: 0, __v: 0 });

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  console.log('Recipe Exist: ', recipeExist);

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({ recipe: recipeExist }, StatusCodes.OK, RECIPE.FETCHED, false));
});

//update recipes
export const updateRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const { recipe_name, diet_preference, dish_type, meal_time, description, number_of_servings, ingredients_used, steps } = req.body;

  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, is_deleted: false, status: 'posted' }, { _id: 0, __v: 0 });

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  console.log('Recipe Exist: ', recipeExist);

  // convert string to array of object

  // get url from recipe

  let recipePhoto = { url: recipeExist.recipe_photo?.url, public_id: recipeExist.recipe_photo.public_id };
  let recipePhotoLocalFile;

  if (req.file && req.file.path) {
    recipePhotoLocalFile = req.file.path;
    // delete old photo
    if (recipePhoto.public_id) {
      await deleteOldFileFromCloudinary(recipePhoto.public_id);
    }

    // then upload new one
    const uploadNewRecipePhoto = await uploadOnCloudinary(recipePhotoLocalFile);

    if (uploadNewRecipePhoto?.url && uploadNewRecipePhoto.public_id) {
      recipePhoto = {
        url: uploadNewRecipePhoto.url,
        public_id: uploadNewRecipePhoto.public_id,
      };
    }
  }

  // updating existing ingredient
  if (ingredients_used) {
    const parsedIngredient = JSON.parse(ingredients_used);

    for (const ingredient of parsedIngredient) {
      if (ingredient._id) {
        await Recipe.updateOne(
          { recipe_id: recipeId, 'ingredients_used._id': ingredient._id },
          { $set: { 'ingredients_used.$.name': ingredient.name, 'ingredients_used.$.quantity': ingredient.quantity } }
        );
      } else {
        // adding new ingredient
        await Recipe.updateOne({ recipe_id: recipeId }, { $push: { ingredients_used: ingredient } });
      }
    }
  }
  // updating existing step
  if (steps) {
    const parsedStep = JSON.parse(steps);

    for (const step of parsedStep) {
      if (step._id) {
        await Recipe.updateOne({ recipe_id: recipeId, 'steps._id': step._id }, { $set: { 'steps.$.description': step.description } });
      } else {
        // adding new step
        await Recipe.updateOne({ recipe_id: recipeId }, { $push: { steps: step } });
      }
    }
  }

  // update
  await Recipe.updateOne(
    { recipe_id: recipeId },
    {
      $set: {
        recipe_name,
        diet_preference,
        dish_type,
        meal_time,
        description,
        recipe_photo: recipePhoto,
        number_of_servings,
        updated_at: Date.now(),
      },
    },
    { new: true }
  );

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, RECIPE.UPDATED, false));
});

//delete recipes
export const deleteRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, is_deleted: false, status: 'posted' }, { _id: 0, __v: 0 });

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  console.log('Recipe Exist: ', recipeExist);

  await Recipe.updateOne({ recipe_id: recipeId }, { $set: { is_deleted: true, deleted_at: Date.now(), updated_at: Date.now() } });

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, RECIPE.DELETED, false));
});
