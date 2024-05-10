import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { env } from "../types/env";

async function getConfig() {
  const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_API_BASE_URL,
  });

  return { model: openai(env.OPENAI_LLM_MODEL) };
}

async function generate(message: string) {
  const { model } = await getConfig();

  const result = await generateText({
    model,
    messages: [
      // TODO: Add more messages here
      { role: "user", content: message },
    ],
  });

  return result.text;
}

export async function summarizeText(text: string): Promise<string> {
  
  return generate(text);
}

