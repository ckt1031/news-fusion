import type { RecursivePartial } from '@/types/utils';
import {
	type APIInteraction,
	type APIPingInteraction,
	InteractionType,
} from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';
import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';
import { z } from 'zod';

export default async function verifyDiscordRequest(
	c: Context<Env, '/', BlankInput>,
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

	const pingSchema: z.ZodType<RecursivePartial<APIPingInteraction>> = z.object({
		// InteractionType.PING
		type: z.literal(InteractionType.Ping),
		token: z.string(),
		user: z.object({
			id: z.string(),
		}),
	});

	const interactionCallbackSchema: z.ZodType<RecursivePartial<APIInteraction>> =
		z.object({
			type: z.number(),
			token: z.string(),
			message: z.object({
				id: z.string(),
			}),
			data: z.object({
				component_type: z.number(),
			}),
		});

	await pingSchema.or(interactionCallbackSchema).parseAsync(interaction);

	return { interaction, isValid: true };
}
