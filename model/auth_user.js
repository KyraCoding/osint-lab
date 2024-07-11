import mongoose from "mongoose";
const { Schema, model } = mongoose;

const auth_user_schema = new Schema({
  preferred_name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const auth_user = model("auth_user", auth_user_schema);
export default auth_user;
