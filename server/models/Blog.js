import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    excerpt: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, trim: true, default: "", maxlength: 12000 },
    linkUrl: { type: String, trim: true, default: "", maxlength: 2048 },
    imageUrl: { type: String, trim: true, default: "", maxlength: 2048 },
    publishedAt: { type: String, trim: true, default: "", maxlength: 80 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Blog", blogSchema);
