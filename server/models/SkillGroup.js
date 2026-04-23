import mongoose from "mongoose";

const skillGroupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    items: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("SkillGroup", skillGroupSchema);
