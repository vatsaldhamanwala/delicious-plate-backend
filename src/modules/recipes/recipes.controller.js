import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../utils/async-handler.js';
import { RECIPE } from '../../common/global.common.js';
import { generatePublicId } from '../../common/functions.common.js';
import { Recipe } from './recipes.model.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { User } from '../users/users.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';

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
    created_at: Date.now(),
  });

  //pushing this recipe into users post field
  await User.findOneAndUpdate({ user_id: req.user.user_id }, { $push: { post: newRecipe._id } }, { new: true, updated_at: Date.now() });

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

  const uploadedRecipePhoto = await uploadOnCloudinary(recipePhotoLocalFile);

  if (uploadedRecipePhoto?.url && uploadedRecipePhoto.public_id) {
    recipePhoto = {
      url: uploadedRecipePhoto.url || '',
      public_id: uploadedRecipePhoto.public_id || '',
    };
  }

  const updatedRecipe = await Recipe.updateOne(
    { recipe_id: recipeId },
    { $set: { recipe_photo: recipePhoto }, progress_steps: 2, status: 'draft' },
    { updated_at: Date.now() }
  );

  console.log('Updated Recipe: ', updatedRecipe);

  //return respond
  return res.status(StatusCodes.CREATED).send(responseGenerators({ recipe: updatedRecipe }, StatusCodes.CREATED, RECIPE.CREATED, false));
});

//step-3:- ingredients-and-steps

//step-4:- review/ posted

//get recipes

//get recipes by id

//update recipes

//delete recipes
