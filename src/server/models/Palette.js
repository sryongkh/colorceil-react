import mongoose from "mongoose";

const paletteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 80, trim: true },
    colors: {
      type: [String],
      required: true,
      validate: (colors) =>
        colors.length === 5 &&
        colors.every((color) => /^#[0-9a-f]{6}$/i.test(color)),
    },
    tags: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    seedKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export default mongoose.model("Palette", paletteSchema);
