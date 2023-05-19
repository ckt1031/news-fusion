import crypto from 'node:crypto';

import axios from 'axios';
import ws from 'ws';

import { userAgent } from '../../constants';
import logger from '../../utils/logger';

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
  const response = await axios.get<IEdgeGPTResponse>(
    'https://www.bing.com/turing/conversation/create',
    {
      headers: {
        'User-Agent': userAgent,
      },
    },
  );

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
                  locale: 'en-US',
                  market: 'en-US',
                  region: 'WW',
                  location: 'lat:47.639557;long:-122.128159;re=1000m;',
                  locationHints: [
                    {
                      Center: {
                        Latitude: 22.347_029_864_211_656,
                        Longitude: 114.194_725_602_113_41,
                      },
                      RegionType: 2,
                      SourceType: 11,
                    },
                    {
                      country: 'Hong Kong',
                      state: 'Central And Western District',
                      city: 'Central',
                      timezoneoffset: 8,
                      countryConfidence: 8,
                      cityConfidence: 8,
                      Center: { Latitude: 22.2794, Longitude: 114.1626 },
                      RegionType: 2,
                      SourceType: 1,
                    },
                  ],
                  // generate a timestamp in the format of '2023-05-05T22:43:45+08:00', can differ with +8:00
                  timestamp: new Date().toISOString().replace(/\.\d{3}/, ''),
                  author: 'user',
                  inputMethod: 'Keyboard',
                  text: `(Do not include any citation , any questions to ask me, response with the answer only) ${textPrompt}`,
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
