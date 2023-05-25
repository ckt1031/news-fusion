import crypto from 'node:crypto';

import axios from 'axios';
import random from 'random';
import ws from 'ws';

import logger from './logger';

export interface IEdgeGPTResponse {
  conversationId: string;
  clientId: string;
  conversationSignature: string;
  result: {
    value: string;
    message: string | null;
  };
}

export type ChatMode = 'Creative' | 'Precise' | 'Balanced';

export enum ChatModeOptions {
  creative = 'h3imaginative',
  precise = 'h3precise',
  balanced = 'galileo',
}

async function getConversation() {
  // Generate random IP between range 13.104.0.0/14
  const FORWARDED_IP = `13.${random.int(104, 107)}.${random.int(0, 255)}.${random.int(0, 255)}`;

  const HEADERS = {
    authority: 'edgeservices.bing.com',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '"Microsoft Edge";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-bitness': '"64"',
    'sec-ch-ua-full-version': '"113.0.1774.50"',
    'sec-ch-ua-full-version-list':
      '"Microsoft Edge";v="113.0.1774.50", "Chromium";v="113.0.5672.127", "Not-A.Brand";v="24.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"15.0.0"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.50',
    'x-edge-shopping-flag': '1',
    'x-forwarded-for': FORWARDED_IP,
  };

  const response = await axios.get<IEdgeGPTResponse>(
    'https://www.bing.com/turing/conversation/create',
    {
      headers: HEADERS,
    },
  );

  // If the response is not successful, throw an error
  if (response.status !== 200) {
    throw new Error(`BingAI: Conversation creation failed: ${response.status}`);
  }

  if (response.data.result.value !== 'Success' && response.data.result.message) {
    throw new Error(response.data.result.message);
  }

  logger.info(`BingAI: Conversation created: ${response.data.conversationId}`);

  return response.data;
}

export async function getBingResponse(mode: ChatMode, textPrompt: string) {
  const conversation = await getConversation();

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const textResult = new Promise<string>((resolve, reject) => {
    const terminalChar = '';
    const wsURL = 'wss://sydney.bing.com/sydney/ChatHub';
    // Use prompt to get response from GPT WebSocket
    const wsClient = new ws(wsURL);

    let stage = 0;
    let isFulfilled = false;
    let wsPushInterval: NodeJS.Timeout;

    wsClient.on('open', () => {
      logger.info(`BingAI: WebSocket connection opened: ${conversation.conversationId}`);
      // Send initial message to GPT WebSocket
      wsClient.send(JSON.stringify({ protocol: 'json', version: 1 }) + terminalChar);
    });

    wsClient.on('error', error => {
      logger.error('BingAI: WebSocket error:', error);

      if (!isFulfilled) {
        isFulfilled = true;
        reject(new Error(`WebSocket error: ${error.toString()}`));
      }
    });

    wsClient.on('message', data => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const objects = data.toString().split(terminalChar);
      const response = JSON.parse(objects[0]);

      // If Type 2, then it is the final response
      if (response.type === 2) {
        const resultText = response.item.messages[1].text as string;

        isFulfilled = true;

        // Stop sending prompts
        clearInterval(wsPushInterval);

        // Close WebSocket connection
        wsClient.close();

        logger.info(`BingAI: Response received: ${conversation.conversationId}`);

        resolve(resultText);
      }

      // After receiving the initial message, send the prompt
      if (stage === 0) {
        logger.info('Sending prompt to GPT WebSocket');

        wsPushInterval = setInterval(() => {
          wsClient.send(JSON.stringify({ type: 6 }) + terminalChar);
        }, 5000);

        wsClient.send(JSON.stringify({ type: 6 }) + terminalChar);

        const traceId = crypto.randomBytes(16).toString('hex');

        // Send prompt
        wsClient.send(
          JSON.stringify({
            arguments: [
              {
                source: 'cib',
                optionsSets: [
                  'dtappid',
                  'enablemm',
                  'deepleo',
                  'dv3sugg',
                  'cricinfo',
                  'cricinfov2',
                  'disable_emoji_spoken_text',
                  'nlu_direct_response_filter',
                  'responsible_ai_policy_235',
                  ChatModeOptions[mode as keyof typeof ChatModeOptions],
                ],
                allowedMessageTypes: ['Chat'],
                sliceIds: ['222dtappid', '225cricinfo', '224locals0'],
                traceId: traceId,
                isStartOfSession: true,
                message: {
                  // generate a timestamp in the format of '2023-05-05T22:43:45+08:00', can differ with +8:00
                  timestamp: new Date().toISOString().replace(/\.\d{3}/, ''),
                  author: 'user',
                  text: `With NO any citation, any questions to ask me, give the response text only :), ${textPrompt}`,
                  messageType: 'Chat',
                },
                conversationSignature: conversation.conversationSignature,
                participant: { id: conversation.clientId },
                conversationId: conversation.conversationId,
              },
            ],
            invocationId: '0',
            target: 'chat',
            type: 4,
          }) + terminalChar,
        );

        stage = 1;
      }
    });
  });

  return textResult;
}
