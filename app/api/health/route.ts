import { NextResponse } from "next/server";
import { testTranslationIntegration, MODEL } from "@/lib/translation";

export async function GET() {
  const healthStatus = await testTranslationIntegration();

  return NextResponse.json(
    {
      status: healthStatus.status,
      integration: {
        model: MODEL,
        error: healthStatus.error,
        results: healthStatus.results,
      },
      timestamp: healthStatus.timestamp,
    },
    {
      status: healthStatus.status === "healthy" ? 200 : 503,
    }
  );
}
