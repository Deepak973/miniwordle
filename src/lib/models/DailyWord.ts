import mongoose, { Schema, Document } from "mongoose";

export interface IDailyWord extends Document {
  date: string; // YYYY-MM-DD format
  word: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyWordSchema = new Schema<IDailyWord>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    word: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 5,
      maxlength: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one word per day
DailyWordSchema.index({ date: 1 }, { unique: true });

export default mongoose.models.DailyWord ||
  mongoose.model<IDailyWord>("DailyWord", DailyWordSchema);
