const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiseaseAdviceSchema = new Schema(
  {
    targetDisease: { type: String, required: true, index: true },
    dos: [{ type: String }],
    donts: [{ type: String }],
    publishedBy: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

DiseaseAdviceSchema.index({ targetDisease: 1, isActive: 1 });

module.exports = mongoose.model("DiseaseAdvice", DiseaseAdviceSchema);
