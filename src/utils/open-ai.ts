import cl100k_base from '@dqbd/tiktoken/encoders/cl100k_base.json' assert { type: 'json' };
import { Tiktoken } from '@dqbd/tiktoken/lite';
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

  let model = 'gpt-3.5-turbo';

  const encoding = new Tiktoken(
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str,
  );

  const tokens = encoding.encode(prompt);

  if (tokens.length > 3500) {
    model = 'gpt-3.5-turbo-16k';
  }

  encoding.free();

  const chatCompletion = await openai.createChatCompletion({
    temperature: 0,
    max_tokens: 1000,
    model: process.env.OPENAI_DEFAULT_MODEL ?? model,
    messages: [{ role: 'user', content: prompt }],
  });

  return chatCompletion.data.choices[0].message?.content;
}
