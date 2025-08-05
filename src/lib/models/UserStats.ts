import mongoose, { Schema, Document } from "mongoose";

export interface IUserStats extends Document {
  userId: string;
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  averageAttempts: number;
  lastPlayedDate: string; // YYYY-MM-DD format
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    maxStreak: {
      type: Number,
      default: 0,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesWon: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    averageAttempts: {
      type: Number,
      default: 0,
    },
    lastPlayedDate: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserStats ||
  mongoose.model<IUserStats>("UserStats", UserStatsSchema);
