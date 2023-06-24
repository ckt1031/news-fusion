import axios from 'axios';

const OPEN_AI_API_KEY = process.env.OPENAI_API_KEY;
const OPEN_AI_BASE_URL = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com';

export async function getOpenaiResponse({ prompt }: { prompt: string }) {
  const { data, status } = await axios.post(
    `${OPEN_AI_BASE_URL}/v1/chat/completions`,
    {
      prompt,
      model: 'gpt-3.5-turbo-0613',
      max_tokens: 1700,
      temperature: 0.5,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPEN_AI_API_KEY}`,
      },
    },
  );

  if (status !== 200 || !data.choices[0].message?.content) {
    return null;
  }

  return data.choices[0].message?.content as string;
}
