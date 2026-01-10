import { generateText, generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const MODEL = google("gemini-flash-lite-latest");
const TEMPERATURE = 0.1;

/**
 * Tests the integration with the LLM translation library
 * @returns Object with status and optional error message
 */
export async function testTranslationIntegration(): Promise<{
  status: "healthy" | "unhealthy";
  error?: string;
  timestamp: string;
  results: any[];
}> {
  const results = [];

  try {
    // Test with a simple translation
    const inputText = "hello";
    const source = "en";
    const target = "es";
    const resultText = await translateText(inputText, source, target);
    results.push({ inputText, source, target, resultText });

    // const inputObject = { inputText };
    // const resultObject = await translateObject(inputObject, source, target);
    // results.push({ inputObject, source, target, resultObject });

    // Basic validation - if we get a response, the integration is working
    if (resultText && resultText.trim().length > 0) {
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        results,
      };
    } else {
      return {
        status: "unhealthy",
        error: "Translation returned empty response",
        timestamp: new Date().toISOString(),
        results,
      };
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
      results,
    };
  }
}

/**
 * Translates text from source language to target language
 * @param text - The text to translate
 * @param source - Source language (defaults to "auto")
 * @param target - Target language
 * @returns Translated text
 */
export async function translateText(
  text: string,
  source: string = "auto",
  target: string
): Promise<string> {
  const { text: translatedText } = await generateText({
    model: MODEL,
    prompt: `Translate the following text from ${source} to ${target}. Only return the translated text, nothing else:

"${text}"`,
    temperature: TEMPERATURE,
  });

  return translatedText.trim();
}

/**
 * Creates a dynamic Zod schema based on the input object structure
 */
function createSchemaFromObject(obj: any): z.ZodType<any> {
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      // For empty arrays, return a schema that accepts any array
      return z.array(z.unknown()).optional();
    }
    return z.array(createSchemaFromObject(obj[0]));
  }

  if (obj && typeof obj === "object") {
    const shape: Record<string, z.ZodType<any>> = {};
    for (const [key, value] of Object.entries(obj)) {
      shape[key] = createSchemaFromObject(value);
    }
    return z.object(shape);
  }

  if (typeof obj === "string") {
    return z.string();
  }

  if (typeof obj === "number") {
    return z.number();
  }

  if (typeof obj === "boolean") {
    return z.boolean();
  }

  if (obj === null) {
    return z.null();
  }

  return z.unknown();
}

/**
 * Translates all string values in an object from source language to target language
 * @param object - The object to translate
 * @param source - Source language (defaults to "auto")
 * @param target - Target language
 * @returns Translated object with same structure
 */
export async function translateObject(
  object: any,
  source: string = "auto",
  target: string
): Promise<any> {
  const schema = createSchemaFromObject(object);

  const { object: translatedObject } = await generateObject({
    model: MODEL,
    prompt: `Translate all string values in the following JSON object from ${source} to ${target}. 
      Keep the structure exactly the same, only translate string values. 
      Do not translate keys, only values. 
      Keep numbers, booleans, null values, and other non-string values unchanged.
      Preserve empty arrays as empty arrays [].
      Do not add or remove any fields or array elements.
      
      Object to translate: ${JSON.stringify(object, null, 2)}`,
    schema: schema,
    temperature: TEMPERATURE,
  });

  return translatedObject;
}
