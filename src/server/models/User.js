import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  resetPasswordToken: { type: String },
  name: { type: String },
  bio: { type: String },
  website: { type: String },
});

export default mongoose.model("User", UserSchema);
