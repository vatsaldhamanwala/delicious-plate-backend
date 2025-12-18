import mongoose, { Schema } from 'mongoose';

const recipeSchema = new Schema({
  recipe_id: { type: String, unique: true, required: true, index: true },
  user_id: { type: String, index: true },
  recipe_name: { type: String, required: true },
  diet_preference: { type: [String], enum: ['veg', 'non-veg', 'healthy', 'beverages', 'vegan'], required: true, index: true },
  dish_type: {
    type: [String],
    enum: ['burger', 'pizza', 'pasta', 'chicken', 'noodles', 'sandwich', 'panner', 'salad', 'soup', 'dessert', 'tea', 'coffee', 'soda'],
    required: true,
    index: true,
  },
  meal_time: { type: [String], enum: ['breakfast', 'lunch', 'evening', 'dinner', 'snacks', 'main-course', 'starters'], required: true, index: true },
  description: { type: String, required: true },
  recipe_photo: { url: { type: String }, public_id: { type: String } }, // cloudinary URL
  number_of_servings: { type: Number },
  ingredients: [
    {
      ingredients_id: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: String, required: true },
    },
  ],
  steps: [{ steps_id: { type: String, required: true }, description: { type: String, required: true } }],
  likes: { type: Number, default: 0, min: 0 },
  liked_by: [{ type: String, index: true }],
  status: { type: String, enum: ['draft', 'posted'], default: 'draft', index: true },
  is_basic_info_step_completed: { type: Boolean, default: false },
  is_media_step_completed: { type: Boolean, default: false },
  is_ingredients_and_steps_step_completed: { type: Boolean, default: false },

  //common fields
  created_at: { type: Number },
  updated_at: { type: Number },
  updated_by: { type: String },
  deleted_at: { type: Number },
  deleted_by: { type: String },
  is_deleted: { type: Boolean, default: false, index: true },
});

export const Recipe = mongoose.model('recipes', recipeSchema);
