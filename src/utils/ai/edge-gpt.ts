import { BingChat } from 'bing-chat';

export type ChatMode = 'Creative' | 'Precise' | 'Balanced';

export async function getBingResponse(mode: ChatMode, textPrompt: string) {
  const api = new BingChat({
    cookie: '.',
  });

  const res = await api.sendMessage(
    `(Do not include any citation , any questions to ask me, response with the answer only) ${textPrompt}`,
    {
      // change the variant to 'Precise'
      variant: mode,
    },
  );

  return res.text;
}
