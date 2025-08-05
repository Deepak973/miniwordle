import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  userId: string;
  date: string; // YYYY-MM-DD format
  guesses: string[];
  statuses: ("correct" | "present" | "absent")[][];
  completed: boolean;
  won: boolean;
  attempts: number;
  timeTaken: number;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGame>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    guesses: {
      type: [String],
      default: [],
    },
    statuses: {
      type: [[String]],
      default: [],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    won: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one game per user per day
GameSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Game ||
  mongoose.model<IGame>("Game", GameSchema);
