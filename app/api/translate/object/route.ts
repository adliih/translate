import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { object, source, target } = body

    // Validate input
    if (!object || typeof object !== "object") {
      return NextResponse.json({ error: "Object is required and must be a valid object" }, { status: 400 })
    }

    if (!source || !target) {
      return NextResponse.json({ error: "Source and target languages are required" }, { status: 400 })
    }

    // Create a dynamic schema based on the input object structure
    const createSchemaFromObject = (obj: any): z.ZodType<any> => {
      if (Array.isArray(obj)) {
        if (obj.length === 0) return z.array(z.any())
        return z.array(createSchemaFromObject(obj[0]))
      }

      if (obj && typeof obj === "object") {
        const shape: Record<string, z.ZodType<any>> = {}
        for (const [key, value] of Object.entries(obj)) {
          shape[key] = createSchemaFromObject(value)
        }
        return z.object(shape)
      }

      if (typeof obj === "string") {
        return z.string()
      }

      if (typeof obj === "number") {
        return z.number()
      }

      if (typeof obj === "boolean") {
        return z.boolean()
      }

      return z.any()
    }

    const schema = createSchemaFromObject(object)

    // Use Gemini to translate the object
    const { object: translatedObject } = await generateObject({
      model: google("gemini-2.0-flash"),
      prompt: `Translate all string values in the following JSON object from ${source} to ${target}. 
      Keep the structure exactly the same, only translate string values. 
      Do not translate keys, only values. 
      Keep numbers, booleans, and other non-string values unchanged.
      
      Object to translate: ${JSON.stringify(object, null, 2)}`,
      schema: schema,
      temperature: 0.1,
    })

    return NextResponse.json({
      translatedObject,
    })
  } catch (error) {
    console.error("Object translation error:", error)
    return NextResponse.json(
      { error: "Object translation failed. Please check your JSON format and try again." },
      { status: 500 },
    )
  }
}
