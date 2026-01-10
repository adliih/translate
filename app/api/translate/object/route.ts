import { type NextRequest, NextResponse } from "next/server";
import { translateObject } from "@/lib/translation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { object, source, target } = body;

    // Validate input
    if (!object || typeof object !== "object") {
      return NextResponse.json(
        { error: "Object is required and must be a valid object" },
        { status: 400 }
      );
    }

    if (!target) {
      return NextResponse.json(
        { error: "Target languages are required" },
        { status: 400 }
      );
    }

    source ||= "auto";

    // Use reusable translation function
    const translatedObject = await translateObject(object, source, target);

    return NextResponse.json({
      translatedObject,
    });
  } catch (error) {
    console.error("Object translation error:", error);
    return NextResponse.json(
      {
        error:
          "Object translation failed. Please check your JSON format and try again.",
      },
      { status: 500 }
    );
  }
}
