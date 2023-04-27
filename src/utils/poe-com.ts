import axios from 'axios';

export const url = 'https://www.quora.com/poe_api/gql_POST';

export const headers = {
  Host: 'www.quora.com',
  Accept: '*/*',
  Connection: 'keep-alive',
  'Content-Type': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'apollographql-client-version': '1.1.6-65',
  'apollographql-client-name': 'com.quora.app.Experts-apollo-ios',
  'User-Agent': 'Poe 1.1.6 rv:65 env:prod (iPhone14,2; iOS 16.2; en_US)',
  // Credentials
  Cookie: process.env.POE_COOKIE,
  'Quora-Formkey': process.env.POE_QUORA_FORMKEY,
};

export async function cleanRequestPrompt(msg: string, bot = 'capybara') {
  // Trigger Poe.com APIs
  const chatId = await loadChatIdMap(bot);

  await clearContext(chatId);
  await sendMessage(msg, bot, chatId);

  // Get the latest response.
  return await getLatestMessage(bot);
}

export async function loadChatIdMap(bot = 'a2'): Promise<string> {
  const data = {
    operationName: 'ChatViewQuery',
    query:
      'query ChatViewQuery($bot: String!) {\n  chatOfBot(bot: $bot) {\n    __typename\n    ...ChatFragment\n  }\n}\nfragment ChatFragment on Chat {\n  __typename\n  id\n  chatId\n  defaultBotNickname\n  shouldShowDisclaimer\n}',
    variables: {
      bot: bot,
    },
  };
  const response = await axios.post(url, data, { headers });

  return response.data.data.chatOfBot.chatId as string;
}

export async function sendMessage(message: string, bot = 'a2', chat_id = '') {
  const data = {
    operationName: 'AddHumanMessageMutation',
    query:
      'mutation AddHumanMessageMutation($chatId: BigInt!, $bot: String!, $query: String!, $source: MessageSource, $withChatBreak: Boolean! = false) {\n  messageCreate(\n    chatId: $chatId\n    bot: $bot\n    query: $query\n    source: $source\n    withChatBreak: $withChatBreak\n  ) {\n    __typename\n    message {\n      __typename\n      ...MessageFragment\n      chat {\n        __typename\n        id\n        shouldShowDisclaimer\n      }\n    }\n    chatBreak {\n      __typename\n      ...MessageFragment\n    }\n  }\n}\nfragment MessageFragment on Message {\n  id\n  __typename\n  messageId\n  text\n  linkifiedText\n  authorNickname\n  state\n  vote\n  voteReason\n  creationTime\n  suggestedReplies\n}',
    variables: {
      bot: bot,
      chatId: chat_id,
      query: message,
      source: null,
      withChatBreak: false,
    },
  };

  await axios.post(url, data, { headers });
}

export async function clearContext(chatid: string) {
  const data = {
    operationName: 'AddMessageBreakMutation',
    query:
      'mutation AddMessageBreakMutation($chatId: BigInt!) {\n  messageBreakCreate(chatId: $chatId) {\n    __typename\n    message {\n      __typename\n      ...MessageFragment\n    }\n  }\n}\nfragment MessageFragment on Message {\n  id\n  __typename\n  messageId\n  text\n  linkifiedText\n  authorNickname\n  state\n  vote\n  voteReason\n  creationTime\n  suggestedReplies\n}',
    variables: {
      chatId: chatid,
    },
  };

  await axios.post(url, data, { headers });
}

export async function getLatestMessage(bot: string) {
  const data = {
    operationName: 'ChatPaginationQuery',
    query:
      'query ChatPaginationQuery($bot: String!, $before: String, $last: Int! = 10) {\n  chatOfBot(bot: $bot) {\n    id\n    __typename\n    messagesConnection(before: $before, last: $last) {\n      __typename\n      pageInfo {\n        __typename\n        hasPreviousPage\n      }\n      edges {\n        __typename\n        node {\n          __typename\n          ...MessageFragment\n        }\n      }\n    }\n  }\n}\nfragment MessageFragment on Message {\n  id\n  __typename\n  messageId\n  text\n  linkifiedText\n  authorNickname\n  state\n  vote\n  voteReason\n  creationTime\n}',
    variables: {
      before: null,
      bot: bot,
      last: 1,
    },
  };

  let text = '';
  let authorNickname = '';
  let state = 'incomplete';

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await axios.post(url, data, { headers });
    const responseData = response.data;
    const lastMessage = responseData.data.chatOfBot.messagesConnection.edges.slice(-1)[0].node;
    text = lastMessage.text;
    state = lastMessage.state;
    authorNickname = lastMessage.authorNickname;
    if (authorNickname === bot && state === 'complete') {
      break;
    }
  }

  return text;
}
