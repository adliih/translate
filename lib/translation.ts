import { generateText, Output, type LanguageModelUsage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

/** Single source of truth for logs and the Anthropic client */
export const TRANSLATION_MODEL_ID = "claude-haiku-4-5-20251001" as const;
export const MODEL = anthropic(TRANSLATION_MODEL_ID);
const TEMPERATURE = 0.1;

/** Rough upper-bound token estimate from character count (English-ish text). */
function estimateTokens(chars: number): number {
  return Math.ceil(chars / 4);
}

function logTranslationTelemetry(payload: {
  event: "translation.llm.complete" | "translation.llm.error";
  operation: string;
  modelId: string;
  durationMs: number;
  promptChars: number;
  jsonPayloadChars?: number;
  usage?: LanguageModelUsage;
  totalUsage?: LanguageModelUsage;
  error?: string;
  meta?: Record<string, unknown>;
}): void {
  const u = payload.totalUsage ?? payload.usage;
  console.log(
    JSON.stringify({
      event: payload.event,
      operation: payload.operation,
      modelId: payload.modelId,
      durationMs: payload.durationMs,
      promptChars: payload.promptChars,
      jsonPayloadChars: payload.jsonPayloadChars,
      estimatedPromptTokens: estimateTokens(payload.promptChars),
      inputTokens: u?.inputTokens,
      outputTokens: u?.outputTokens,
      cacheReadTokens: u?.inputTokenDetails?.cacheReadTokens,
      cacheWriteTokens: u?.inputTokenDetails?.cacheWriteTokens,
      error: payload.error,
      meta: payload.meta,
    }),
  );
}

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
  target: string,
): Promise<string> {
  const prompt = `Translate (${source}→${target}). Output only the translated text, no explanation:
${text}`;
  const started = performance.now();

  try {
    const result = await generateText({
      model: MODEL,
      prompt,
      temperature: TEMPERATURE,
    });
    logTranslationTelemetry({
      event: "translation.llm.complete",
      operation: "translateText",
      modelId: TRANSLATION_MODEL_ID,
      durationMs: Math.round(performance.now() - started),
      promptChars: prompt.length,
      usage: result.usage,
      totalUsage: result.totalUsage,
      meta: { source, target },
    });
    return result.text.trim();
  } catch (err) {
    logTranslationTelemetry({
      event: "translation.llm.error",
      operation: "translateText",
      modelId: TRANSLATION_MODEL_ID,
      durationMs: Math.round(performance.now() - started),
      promptChars: prompt.length,
      error: err instanceof Error ? err.message : String(err),
      meta: { source, target },
    });
    throw err;
  }
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
  target: string,
): Promise<any> {
  const schema = createSchemaFromObject(object);
  const payload = JSON.stringify(object);
  const prompt = `Strings only: ${source}→${target}. Same JSON shape and keys; translate string values only; leave numbers/bools/null and array lengths unchanged.

${payload}`;
  const started = performance.now();

  try {
    const result = await generateText({
      model: MODEL,
      prompt,
      output: Output.object({ schema }),
      temperature: TEMPERATURE,
    });
    logTranslationTelemetry({
      event: "translation.llm.complete",
      operation: "translateObject",
      modelId: TRANSLATION_MODEL_ID,
      durationMs: Math.round(performance.now() - started),
      promptChars: prompt.length,
      jsonPayloadChars: payload.length,
      usage: result.usage,
      totalUsage: result.totalUsage,
      meta: { source, target },
    });
    return result.output;
  } catch (err) {
    logTranslationTelemetry({
      event: "translation.llm.error",
      operation: "translateObject",
      modelId: TRANSLATION_MODEL_ID,
      durationMs: Math.round(performance.now() - started),
      promptChars: prompt.length,
      jsonPayloadChars: payload.length,
      error: err instanceof Error ? err.message : String(err),
      meta: { source, target },
    });
    throw err;
  }
}

/**
 * Translates all string values in an object to multiple target languages in a single LLM call
 * @param object - The object to translate
 * @param source - Source language (defaults to "auto")
 * @param targets - Array of target language codes (e.g., ["es", "fr", "de"])
 * @returns Object with language codes as keys and translated objects as values
 *          Example: { "es": {...}, "fr": {...}, "de": {...} }
 */
export async function translateObjectToMultipleLanguages(
  object: any,
  source: string = "auto",
  targets: string[],
): Promise<Record<string, any>> {
  if (!targets || targets.length === 0) {
    throw new Error("At least one target language is required");
  }

  // Create a schema where each target language is a key pointing to the translated object structure
  const baseSchema = createSchemaFromObject(object);
  const multiLanguageSchema: Record<string, z.ZodType<any>> = {};

  for (const target of targets) {
    multiLanguageSchema[target] = baseSchema;
  }

  const schema = z.object(multiLanguageSchema);
  const codes = targets.join(",");
  const payload = JSON.stringify(object);
  const prompt = `Strings only: ${source}→[${codes}]. Top-level keys exactly: ${codes}; each value mirrors the input shape; translate strings only; preserve numbers/bools/null and array lengths.

${payload}`;
  const started = performance.now();

  try {
    const result = await generateText({
      model: MODEL,
      prompt,
      output: Output.object({ schema }),
      temperature: TEMPERATURE,
    });
    logTranslationTelemetry({
      event: "translation.llm.complete",
      operation: "translateObjectToMultipleLanguages",
      modelId: TRANSLATION_MODEL_ID,
      durationMs: Math.round(performance.now() - started),
      promptChars: prompt.length,
      jsonPayloadChars: payload.length,
      usage: result.usage,
      totalUsage: result.totalUsage,
      meta: { source, targets },
    });
    return result.output as Record<string, any>;
  } catch (err) {
    logTranslationTelemetry({
      event: "translation.llm.error",
      operation: "translateObjectToMultipleLanguages",
      modelId: TRANSLATION_MODEL_ID,
      durationMs: Math.round(performance.now() - started),
      promptChars: prompt.length,
      jsonPayloadChars: payload.length,
      error: err instanceof Error ? err.message : String(err),
      meta: { source, targets },
    });
    throw err;
  }
}
