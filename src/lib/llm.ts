import OpenAI from "openai";
import { ServerEnv } from "../types/env";
import summarizePrompt from "../prompts/summarize";

async function generate(env: ServerEnv, message: string) {
  // const result = await openai.chat.completions.create({
  //   model: env.OPENAI_LLM_MODEL,
  //   messages: [{ role: "user", content: message }],
  // });

  const response = await fetch(`${env.OPENAI_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      stream: false,
      model: env.OPENAI_LLM_MODEL,
      messages: [{ role: "user", content: message }],
    })
  })

  const result = await response.json() as OpenAI.ChatCompletion;

  return result.choices[0].message.content;
}

export async function summarizeText(env: ServerEnv, originalContent: string) {
  return await generate(env, `${summarizePrompt}\n\n${originalContent}`);
}
