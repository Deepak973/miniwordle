import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import DailyWord from "../../../lib/models/DailyWord";

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toLocaleDateString("en-CA");
}

// GET: Get daily word for today or specific date
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || getTodayDate();

    // Find the daily word for the specified date
    const dailyWord = await DailyWord.findOne({ date });

    if (!dailyWord) {
      return NextResponse.json(
        {
          error: "No daily word found for this date",
          date: date,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      date: dailyWord.date,
      word: dailyWord.word,
    });
  } catch (error) {
    console.error("Error in GET /api/daily-word:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Add a daily word (admin function)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { date, word } = body;

    if (!date || !word) {
      return NextResponse.json(
        { error: "date and word are required" },
        { status: 400 }
      );
    }

    // Check if word already exists for this date
    const existingWord = await DailyWord.findOne({ date });
    if (existingWord) {
      return NextResponse.json(
        { error: "Daily word already exists for this date" },
        { status: 409 }
      );
    }

    // Create new daily word - store encrypted string as-is
    const dailyWord = new DailyWord({
      date,
      word,
    });

    await dailyWord.save();

    return NextResponse.json({
      success: true,
      date: dailyWord.date,
      word: dailyWord.word,
    });
  } catch (error: any) {
    console.error("Error in POST /api/daily-word:", error);
    // Handle duplicate key error from Mongo
    if (error && (error.code === 11000 || error.code === "E11000")) {
      return NextResponse.json(
        { error: "Daily word already exists for this date" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
