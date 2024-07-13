import mongoose from "mongoose";
const { Schema, model } = mongoose;
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

// Beginner, easy, medium, hard
var min_values = [50, 100, 150, 200];

const challenge_schema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    solvedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    flag: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: Number, default: 1 },
    author: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    maxValue: { type: Number, default: 500 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in `JSON.stringify()`
    toObject: { virtuals: true },
  }
);

challenge_schema.virtual("solveCount").get(function () {
  return this.solvedBy.length;
});

challenge_schema.virtual("decay").get(function () {
  return 100;
});

challenge_schema.virtual("minValue").get(function () {
  return min_values[this.difficulty];
});

challenge_schema.virtual("score").get(function () {
  return Math.max(
    Math.ceil(
      ((this.minValue - this.maxValue) / this.decay ** 2) *
        this.solveCount ** 2 +
        this.maxValue
    ),
    this.minValue
  );
});

challenge_schema.plugin(mongooseLeanVirtuals);

// Indexes for sorting and listing
challenge_schema.index({ category: 1, score: -1, solveCount: -1 });

const Challenge = model("Challenge", challenge_schema);
export default Challenge;
