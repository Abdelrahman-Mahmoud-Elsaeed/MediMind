const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiseaseBlogSchema = new Schema(
  {
    targetDisease: { type: String, required: true, index: true },
    title: { type: String, required: true },
    coverImageURL: { type: String },
    content: { type: String, required: true },
    publishedBy: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

DiseaseBlogSchema.index({ targetDisease: 1, isActive: 1 });

module.exports = mongoose.model("DiseaseBlog", DiseaseBlogSchema);
