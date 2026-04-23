import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    issuer: { type: String, required: true, trim: true, maxlength: 160 },
    date: { type: String, required: true, trim: true, maxlength: 80 },
    credentialUrl: { type: String, trim: true, default: "", maxlength: 2048 },
    imageUrl: { type: String, trim: true, default: "", maxlength: 2048 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Certification", certificationSchema);
