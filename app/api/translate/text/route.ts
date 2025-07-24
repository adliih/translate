import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, source, target } = body

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    if (!source || !target) {
      return NextResponse.json({ error: "Source and target languages are required" }, { status: 400 })
    }

    // Use Gemini to translate text
    const { text: translatedText } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `Translate the following text from ${source} to ${target}. Only return the translated text, nothing else:

"${text}"`,
      temperature: 0.1,
    })

    return NextResponse.json({
      translatedText: translatedText.trim(),
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Translation failed. Please try again." }, { status: 500 })
  }
}
