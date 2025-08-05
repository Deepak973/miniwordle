import mongoose from "mongoose";

const DailyWordSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    word: {
      type: String,
      required: true, // Removed length + uppercase constraints
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DailyWord ||
  mongoose.model("DailyWord", DailyWordSchema);
