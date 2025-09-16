import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative bg-[#fef3c7]">
        <div tw="flex w-96 h-96 rounded-full overflow-hidden mb-8 border-8 border-white">
          <img
            src={"https://miniwordle.vercel.app/logo.png"}
            alt="Mini Wordle"
            tw="w-full h-full object-cover"
          />
        </div>

        <h1 tw="text-8xl text-[#ff6d4d]">Mini Wordle</h1>
        <p tw="text-5xl mt-4 text-[#ff6d4d] opacity-80">
          Test your vocabulary in 6 tries
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}
