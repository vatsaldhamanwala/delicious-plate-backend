import mongoose, { Schema } from 'mongoose';

const recipeSchema = new Schema({
  recipe_id: { type: String, unique: true, required: true },
  user_id: { type: String },
  recipe_name: { type: String, required: true },
  diet_preference: { type: [String], enum: ['veg', 'non-veg', 'healthy', 'beverages', 'vegan'], required: true },
  dish_type: {
    type: [String],
    enum: ['burger', 'pizza', 'pasta', 'noodles', 'sandwich', 'panner', 'salad', 'soup', 'dessert', 'salad', 'tea', 'coffee', 'soda'],
    required: true,
  },
  meal_time: { type: [String], enum: ['breakfast', 'lunch', 'evening', 'dinner', 'snacks', 'main course', 'starters'], required: true },
  description: { type: String, required: true },
  recipe_photo: { url: { type: String }, public_id: { type: String } }, // cloudinary URL
  number_of_servings: { type: Number },
  ingredients_used: [{ name: { type: String, required: true }, quantity: { type: String, required: true } }],
  steps: [{ description: { type: String, required: true } }],
  likes: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'posted'], default: 'draft' },
  is_basic_info_step_completed: { type: Boolean, default: false },
  is_media_step_completed: { type: Boolean, default: false },
  is_ingredients_and_steps_step_completed: { type: Boolean, default: false },

  //common fields
  created_at: { type: Number },
  updated_at: { type: Number },
  updated_by: { type: String },
  deleted_at: { type: Number },
  deleted_by: { type: String },
  is_deleted: { type: Boolean, default: false },
});

export const Recipe = mongoose.model('recipes', recipeSchema);
