import mongoose from "mongoose";
const { Schema, model } = mongoose;

const challenge_schema = new Schema(
  {
    title: {type: String, required: true},
    category: { type: String, required: true },
    solvedBy: [{ type: Schema.Types.ObjectId, ref: "user" }],
    flag: { type: String, required: true },
    description: { type: String, required: true },
    score: { type: Number, default: 500 },
    solveCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for sorting and listing
challenge_schema.index({ category: 1, score: -1, solveCount: -1 });

const challenge = model("challenge", challenge_schema);
export default challenge;
