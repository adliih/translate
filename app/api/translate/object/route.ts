import { type NextRequest, NextResponse } from "next/server";
import { translateObjectToMultipleLanguages } from "@/lib/translation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { object, source, target, targets } = body;

    // Validate input
    if (!object || typeof object !== "object") {
      return NextResponse.json(
        { error: "Object is required and must be a valid object" },
        { status: 400 }
      );
    }

    source ||= "auto";

    // Support both single target and multiple targets
    if (targets && Array.isArray(targets) && targets.length > 0) {
      // Multiple languages - use single LLM call
      const translatedObjects = await translateObjectToMultipleLanguages(
        object,
        source,
        targets
      );

      return NextResponse.json({
        translatedObjects,
      });
    } else if (target) {
      const translatedObjects = await translateObjectToMultipleLanguages(
        object,
        source,
        [target],
      );

      const translatedObject = translatedObjects[target];

      return NextResponse.json({
        translatedObject,
      });
    } else {
      return NextResponse.json(
        { error: "Either 'target' or 'targets' (array) is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Object translation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Object translation failed. Please check your JSON format and try again.",
      },
      { status: 500 }
    );
  }
}
