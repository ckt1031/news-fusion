import { ServerEnv } from "../types/env";
import {
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageResult,
  RESTGetAPIChannelMessageResult,
  RESTGetAPIChannelResult
} from "discord-api-types/v10";

export async function sendDiscordMessage(
  env: ServerEnv,
  channelId: string,
  messageBody: RESTPostAPIChannelMessageJSONBody
) {
  const api = `https://discord.com/api/v10/channels/${channelId}/messages`;
  const headers = {
    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json",
  };

  const body = JSON.stringify(messageBody);
  const response = await fetch(api, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to send Discord message: ${response.statusText}`);
  }

  return response.json() as unknown as RESTPostAPIChannelMessageResult;
}

export async function getDiscordMessage(env: ServerEnv, messageId: string) {
  const api = `https://discord.com/api/v10/channels/${env.DISCORD_RSS_CHANNEL_ID}/messages/${messageId}`;
  const headers = {
    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(api, { method: "GET", headers });

  if (!response.ok) {
    throw new Error(`Failed to get Discord message: ${response.statusText}`);
  }

  return response.json() as unknown as RESTGetAPIChannelMessageResult;
}

export async function createDiscordThread(
  env: ServerEnv,
  channelId: string,
  messageId: string,
  name: string
) {
  const api = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/threads`;
  const headers = {
    Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(api, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Discord message: ${response.statusText}`);
  }

  return response.json() as unknown as RESTGetAPIChannelResult;
}
