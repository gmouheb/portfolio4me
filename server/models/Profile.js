import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    about: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    highlights: [{ type: String, trim: true }],
    socialLinks: [
      {
        label: { type: String, trim: true },
        href: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Profile", profileSchema);
