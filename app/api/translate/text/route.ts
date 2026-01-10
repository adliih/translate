import { type NextRequest, NextResponse } from "next/server";
import { translateText } from "@/lib/translation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { text, source, target } = body;

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required and must be a string" },
        { status: 400 }
      );
    }

    if (!target) {
      return NextResponse.json(
        { error: "Source and target languages are required" },
        { status: 400 }
      );
    }

    source ||= "auto";

    // Use reusable translation function
    const translatedText = await translateText(text, source, target);

    return NextResponse.json({
      translatedText,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}
