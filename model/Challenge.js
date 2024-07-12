import mongoose from "mongoose";
const { Schema, model } = mongoose;

const challenge_schema = new Schema(
  {
    title: {type: String, required: true},
    category: { type: String, required: true },
    solvedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    flag: { type: String, required: true },
    description: { type: String, required: true },
    score: { type: Number, default: 500 },
    solveCount: { type: Number, default: 0 },
    difficulty: {type: String, required: true},
    author: {type: String, required: true}
  },
  { timestamps: true }
);

// Indexes for sorting and listing
challenge_schema.index({ category: 1, score: -1, solveCount: -1 });

const Challenge = model("Challenge", challenge_schema);
export default Challenge;
