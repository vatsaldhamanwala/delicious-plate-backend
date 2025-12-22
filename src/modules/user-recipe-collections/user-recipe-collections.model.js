import mongoose, { Schema } from 'mongoose';

const userRecipeCollectionSchema = new Schema({
  user_recipe_collection_id: { type: String, unique: true, required: true, index: true },
  user_id: { type: String, index: true },
  name: { type: String, required: true },
  recipes: [{ type: String, index: true }],

  //common fields
  created_at: { type: Number },
  updated_at: { type: Number },
  updated_by: { type: String },
  deleted_at: { type: Number },
  deleted_by: { type: String },
  is_deleted: { type: Boolean, default: false, index: true },
});

export const UserRecipeCollection = mongoose.model('user-recipe-collections', userRecipeCollectionSchema);
