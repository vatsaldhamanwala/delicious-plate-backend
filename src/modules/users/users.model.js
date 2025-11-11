import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  user_id: { type: String, unique: true, required: true },
  full_name: { type: String, required: true },
  user_name: { type: String, required: true, unique: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], trim: true },
  bio: { type: String },
  gender: { type: String, trim: true },
  profile_photo: { url: { type: String }, public_id: { type: String } }, // cloudinary URL
  post: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  followers: { type: Number, default: 0 },
  followings: { type: Number, default: 0 },

  //common fields
  created_at: { type: Number },
  update_at: { type: Number },
  updated_by: { type: String },
  deleted_at: { type: Number },
  deleted_by: { type: String },
  is_deleted: { type: Boolean, default: false },
});

//password hashing using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

//comparing password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model('users', userSchema);
