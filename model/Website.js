import mongoose from "mongoose";
const { Schema, model } = mongoose;

const website_schema = new Schema(
  {
    views: {type: Number},
    
  },
  { timestamps: true }
);

// Define the Challenge model
const Website = mongoose.model("Website", website_schema);
export default Website;
