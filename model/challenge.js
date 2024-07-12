import mongoose from "mongoose";
const { Schema, model } = mongoose;

const challenge_schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});


const challenge = model("challenge_schema", challenge_schema);
export default challenge;
