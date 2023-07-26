import { Configuration, OpenAIApi } from 'openai';

interface GetOpenaiResponse {
  prompt: string;
}

export async function getOpenAIResponse({ prompt }: GetOpenaiResponse) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    basePath: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  });
  const openai = new OpenAIApi(configuration);

  const chatCompletion = await openai.createChatCompletion({
    temperature: 0,
    max_tokens: 1000,
    model: process.env.OPENAI_DEFAULT_MODEL ?? 'gpt-3.5-turbo-16k',
    messages: [{ role: 'user', content: prompt }],
  });

  return chatCompletion.data.choices[0].message?.content;
}
