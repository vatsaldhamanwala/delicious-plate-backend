import mongoose, { Schema } from 'mongoose';

const recipeSchema = new Schema({
  recipe_id: { type: String, unique: true, required: true },
  user_id: { type: String },
  user_name: { type: String },
  name: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  photo: { url: { type: String }, public_id: { type: String } }, // cloudinary URL
  number_of_servings: { type: Number, default: 2 },
  ingredients_used: [{ name: { type: String }, quantity: { type: Number } }],
  steps: [{ type: string, required: true }],
  likes: { type: Number, default: 0 },

  //common fields
  created_at: { type: Number },
  updated_at: { type: Number },
  updated_by: { type: String },
  deleted_at: { type: Number },
  deleted_by: { type: String },
  is_deleted: { type: Boolean, default: false },
});

export const Recipe = mongoose.model('recipes', recipeSchema);
