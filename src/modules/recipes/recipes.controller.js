import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../utils/async-handler.js';
import { RECIPE, USER } from '../../common/global.common.js';
import { generatePublicId, setTimesTamp } from '../../common/functions.common.js';
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
    created_at: setTimesTamp(),
  });

  //return respond
  return res.status(StatusCodes.CREATED).send(responseGenerators({ recipe: newRecipe }, StatusCodes.CREATED, RECIPE.CREATED, false));
});

//step-2:- media
export const createMedia = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, user_id: req.user.user_id, is_deleted: false, status: 'draft' });

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
    { $set: { recipe_photo: recipePhoto, is_media_step_completed: true, status: 'draft', updated_at: setTimesTamp() } },
    { new: true }
  );

  //return respond
  return res.status(StatusCodes.CREATED).send(responseGenerators({}, StatusCodes.CREATED, RECIPE.CREATED, false));
});

//step-3:- ingredients-and-steps
export const createIngredientsAndSteps = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const { number_of_servings, ingredients, steps } = req.body;

  if (number_of_servings === 0 || ingredients.length === 0 || steps.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, RECIPE.ALL_FIELDS_ARE_REQUIRED, true));
  }

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, user_id: req.user.user_id, is_deleted: false, status: 'draft' });

  console.log('Recipe Exist: ', recipeExist);

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  const ingredientsId = generatePublicId();

  const stepsId = generatePublicId();

  const createIngredients = ingredients.map((ingredient) => ({
    ingredients_id: ingredientsId,
    name: ingredient.name,
    quantity_value: ingredient.quantity_value,
    quantity_unit: ingredient.quantity_unit,
  }));

  const createSteps = steps.map((step) => ({
    steps_id: stepsId,
    description: step.description,
  }));

  await Recipe.updateOne(
    { recipe_id: recipeId },
    {
      $set: {
        number_of_servings,
        ingredients: createIngredients,
        steps: createSteps,
        is_ingredients_and_steps_step_completed: true,
        status: 'draft',
        updated_at: setTimesTamp(),
      },
    },
    { new: true }
  );

  //return respond
  return res.status(StatusCodes.CREATED).send(responseGenerators({}, StatusCodes.CREATED, RECIPE.CREATED, false));
});

//step-4:- review/ posted
export const reviewAndPostRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, user_id: req.user.user_id, is_deleted: false, status: 'draft' });

  console.log('Recipe Exist: ', recipeExist);

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  //check all steps are previous steps are completed
  if (recipeExist.is_basic_info_step_completed && recipeExist.is_media_step_completed && recipeExist.is_ingredients_and_steps_step_completed) {
    await Recipe.updateOne({ recipe_id: recipeId }, { $set: { status: 'posted', updated_at: setTimesTamp() } }, { new: true });
  } else {
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, RECIPE.STEP_IS_INCOMPLETE, true));
  }

  //pushing this recipe into users post field

  await User.updateOne(
    { user_id: req.user.user_id },
    {
      $addToSet: { post: recipeExist.recipe_id },
      $set: { updated_at: setTimesTamp() },
    },
    { new: true }
  );

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
  const requestedServing = Number(req.query.number_of_servings);

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, is_deleted: false, status: 'posted' }, { _id: 0, __v: 0 }).lean();

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  console.log('Recipe Exist: ', recipeExist);

  // scaling ingredients as per number of servings
  let scaleIngredient = recipeExist.ingredients;

  if (requestedServing && recipeExist.number_of_servings) {
    const factor = requestedServing / recipeExist.number_of_servings;

    scaleIngredient = recipeExist.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity_value: (ingredient.quantity_value * factor).toFixed(2),
    }));
  }

  const recipeResponse = {
    ...recipeExist,
    ingredients: scaleIngredient,
    requested_serving: requestedServing || 0,
  };

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({ recipe: recipeResponse }, StatusCodes.OK, RECIPE.FETCHED, false));
});

//like and unlike count
export const likeOrUnlikeRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.user_id;

  //find recipe
  const recipeExist = await Recipe.findOne({ recipe_id: recipeId, is_deleted: false, status: 'posted' }, { _id: 0, __v: 0 });
  console.log('Recipe Exist: ', recipeExist);

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  const userExist = await User.findOne({ user_id: userId });
  console.log('userExist: ', userExist);

  //find user
  if (!userExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USER.NOT_FOUND, true));

  // user already like then unlike
  const alreadyLiked = recipeExist.liked_by.includes(userId);

  if (alreadyLiked) {
    await Recipe.updateOne(
      { recipe_id: recipeId },
      {
        $pull: { liked_by: userId },
        $inc: { likes: -1 },
        $set: { updated_at: setTimesTamp() },
      }
    );

    return res.status(StatusCodes.OK).send(responseGenerators({ recipe: recipeExist }, StatusCodes.OK, RECIPE.UNLIKED, false));
  } else {
    await Recipe.updateOne(
      { recipe_id: recipeId },
      {
        $addToSet: { liked_by: userId },
        $inc: { likes: 1 },
        $set: { updated_at: setTimesTamp() },
      }
    );

    return res.status(StatusCodes.OK).send(responseGenerators({ recipe: recipeExist }, StatusCodes.OK, RECIPE.LIKED, false));
  }

  //return respond
});

export const searchRecipeWithFilters = asyncHandler(async (req, res) => {
  const { recipe_name, diet_preference, dish_type, meal_time } = req.query;

  const filters = {
    status: 'posted',
    is_deleted: false,
  };

  //recipe name
  if (recipe_name) {
    filters.recipe_name = { $regex: recipe_name, $options: 'i' };
  }

  //diet_preference
  if (diet_preference) {
    const dietPreferenceArray = diet_preference.split(',');
    filters.diet_preference = { $in: dietPreferenceArray };
  }

  //dish_type
  if (dish_type) {
    const dishTypeArray = dish_type.split(',');
    filters.dish_type = { $in: dishTypeArray };
  }

  //meal_time
  if (meal_time) {
    const mealTypeArray = meal_time.split(',');
    filters.meal_time = { $in: mealTypeArray };
  }

  const recipes = await Recipe.find(filters, {
    _id: 0,
    recipe_name: 1,
    diet_preference: 1,
    dish_type: 1,
    meal_time: 1,
    ingredients: 1,
    steps: 1,
    number_of_servings: 1,
    is_deleted: 1,
    status: 1,
  }).sort({ created_at: -1 });
  console.log('Recipe Exist: ', recipes);

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({ recipes }, StatusCodes.OK, RECIPE.FETCHED, false));
});

//update recipes
export const updateRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;

  const { recipe_name, diet_preference, dish_type, meal_time, description, number_of_servings, ingredients, steps } = req.body;

  const recipeExist = await Recipe.findOne(
    { recipe_id: recipeId, user_id: req.user.user_id, is_deleted: false, status: 'posted' },
    { _id: 0, __v: 0 }
  );

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  console.log('Recipe Exist: ', recipeExist);

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

  let parseDietPreference = diet_preference ? JSON.parse(diet_preference) : recipeExist.diet_preference;
  let parseDishType = dish_type ? JSON.parse(dish_type) : recipeExist.dish_type;
  let parseMealTime = meal_time ? JSON.parse(meal_time) : recipeExist.meal_time;

  const ingredientsId = generatePublicId();

  const stepsId = generatePublicId();

  // ingredient
  if (ingredients) {
    const parsedIngredient = JSON.parse(ingredients);

    //delete ingredient
    const existingIngredientsIds = recipeExist.ingredients.map((ingredient) => ingredient.ingredients_id);
    const IncomingIngredientsIds = parsedIngredient.filter((ingredient) => ingredient.ingredients_id).map((ingredient) => ingredient.ingredients_id);

    const ingredientToDelete = existingIngredientsIds.filter((id) => !IncomingIngredientsIds.includes(id));

    console.log('existingIngredientIds:', existingIngredientsIds);
    console.log('incomingIngredientIds:', IncomingIngredientsIds);
    console.log('ingredientsToDelete:', ingredientToDelete);

    if (ingredientToDelete.length > 0) {
      await Recipe.updateOne({ recipe_id: recipeId }, { $pull: { ingredients: { ingredients_id: { $in: ingredientToDelete } } } });
    }

    // add or update ingredient
    for (const ingredient of parsedIngredient) {
      if (ingredient.ingredients_id) {
        await Recipe.updateOne(
          { recipe_id: recipeId, 'ingredients.ingredients_id': ingredient.ingredients_id },
          {
            $set: {
              'ingredients.$.name': ingredient.name,
              'ingredients.$.quantity_value': ingredient.quantity_value,
              'ingredients.$.quantity_unit': ingredient.quantity_unit,
            },
          }
        );
      } else {
        // adding new ingredient
        await Recipe.updateOne(
          { recipe_id: recipeId },
          {
            $push: {
              ingredients: {
                ingredients_id: ingredientsId,
                name: ingredient.name,
                quantity_value: ingredient.quantity_value,
                quantity_unit: ingredient.quantity_unit,
              },
            },
          }
        );
      }
    }
  }

  // step
  if (steps) {
    const parsedStep = JSON.parse(steps);

    //delete steps
    const existingStepsIds = recipeExist.steps.map((step) => step.steps_id);
    const IncomingStepsIds = parsedStep.filter((step) => step.steps_id).map((step) => step.steps_id);

    const stepToDelete = existingStepsIds.filter((id) => !IncomingStepsIds.includes(id));

    console.log('existingIngredientIds:', existingStepsIds);
    console.log('incomingIngredientIds:', IncomingStepsIds);
    console.log('ingredientsToDelete:', stepToDelete);

    if (stepToDelete.length > 0) {
      await Recipe.updateOne({ recipe_id: recipeId }, { $pull: { steps: { steps_id: { $in: stepToDelete } } } });
    }

    // add or update step
    for (const step of parsedStep) {
      if (step.steps_id) {
        await Recipe.updateOne({ recipe_id: recipeId, 'steps.steps_id': step.steps_id }, { $set: { 'steps.$.description': step.description } });
      } else {
        // adding new step
        await Recipe.updateOne({ recipe_id: recipeId }, { $push: { steps: { steps_id: stepsId, description: step.description } } });
      }
    }
  }

  // update
  await Recipe.updateOne(
    { recipe_id: recipeId },
    {
      $set: {
        recipe_name,
        diet_preference: parseDietPreference,
        dish_type: parseDishType,
        meal_time: parseMealTime,
        description,
        recipe_photo: recipePhoto,
        number_of_servings,
        updated_at: setTimesTamp(),
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

  const recipeExist = await Recipe.findOne(
    { recipe_id: recipeId, user_id: req.user.user_id, is_deleted: false, status: 'posted' },
    { _id: 0, __v: 0 }
  );

  if (!recipeExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, RECIPE.NOT_FOUND, true));

  console.log('Recipe Exist: ', recipeExist);

  await Recipe.updateOne({ recipe_id: recipeId }, { $set: { is_deleted: true, deleted_at: setTimesTamp(), updated_at: setTimesTamp() } });

  //return respond
  return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, RECIPE.DELETED, false));
});
