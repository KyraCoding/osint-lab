import mongoose from "mongoose";
const { Schema, model } = mongoose;

const user_schema = new Schema(
  {
    username: { type: String, required: true },
    solves: [{ type: Schema.Types.ObjectId, ref: "Challenge" }],
    country: { type: String, required: true },
    
  },
  { timestamps: true }
);

// Define the Challenge model
const User = mongoose.model("User", user_schema);
export default User;
