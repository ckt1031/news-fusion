import { Context, Env } from "hono";
import { verifyKey } from "discord-interactions";
import { BlankInput } from "hono/types";
import { APIInteraction } from 'discord-api-types/v10'

export default async function verifyDiscordRequest(
  c: Context<Env, "/", BlankInput>
) {
  const signature = c.req.header("x-signature-ed25519");
  const timestamp = c.req.header("x-signature-timestamp");
  const body = await c.req.text();
  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY);

  if (!isValidRequest) {
    return { isValid: false };
  }

  const interaction: APIInteraction = JSON.parse(body);

  return { interaction, isValid: true };
}
