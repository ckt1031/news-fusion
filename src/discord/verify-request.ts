import type { DiscordInteractionPostContext } from '@/types/hono';
import type { APIInteraction } from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';

export default async function verifyDiscordRequest(
	c: DiscordInteractionPostContext,
) {
	const signature = c.req.header('x-signature-ed25519');
	const timestamp = c.req.header('x-signature-timestamp');
	const body = await c.req.text();
	const isValidRequest =
		signature &&
		timestamp &&
		verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY);

	if (!isValidRequest) {
		return { isValid: false };
	}

	// Safe for assigning APIInteraction because PingInteraction will not be reaching core logic
	const interaction: APIInteraction = JSON.parse(body);

	return { interaction, isValid: true };
}
