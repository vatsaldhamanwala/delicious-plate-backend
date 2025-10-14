import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  user_id: { type: String, unique: true },
  user_name: { type: String, required: true, unique: true, trim: true, index: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], unique: true, trim: true },
  phone_number: { type: Number, unique: true, trim: true },
  bio: { type: String },
  gender: { type: String, required: true, trim: true },
  avatar: { type: String, required: true, trim: true }, // cloudinary URL
  followers: { type: Number },
  followings: { type: String },

  post: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],

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

  this.password = bcrypt.hash(this.password, 10);
});

//comparing password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generating access token
userSchema.methods.generateAccessToken = function () {
  jwt.sign(
    {
      _id: this._id,
      email: this.email,
      user_name: this.user_name,
      full_name: this.full_name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

//generating refresh token
userSchema.methods.generateRefreshToken = function () {
  jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model('users', userSchema);
