import mongoose, { Schema } from 'mongoose';

const sessionSchema = new Schema({
  session_id: { type: String, unique: true, required: true },
  user_id: { type: String },
  user_agent: { type: String },
  is_expired: { type: Boolean, default: false },
  access_token: { type: String },
  refresh_token: { type: String },
  device_ip: { type: String },
  user_agent: { type: String },

  //common fields
  created_at: { type: Number },
  update_at: { type: Number },
  updated_by: { type: String },
  deleted_at: { type: Number },
  deleted_by: { type: String },
  is_deleted: { type: Boolean, default: false },
});

export const Session = mongoose.model('sessions', sessionSchema);
