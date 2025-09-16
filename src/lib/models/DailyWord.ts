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
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one word per day
DailyWordSchema.index({ date: 1 }, { unique: true });

if (mongoose.models.DailyWord) {
  delete mongoose.models.DailyWord;
}

export default mongoose.model<IDailyWord>("DailyWord", DailyWordSchema);
