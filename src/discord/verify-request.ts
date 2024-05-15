import type { APIInteraction } from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';
import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';
import { z } from 'zod';
import type { RecursivePartial } from '../types/utils';

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

	const interaction: APIInteraction = JSON.parse(body);

	const schema: z.ZodType<RecursivePartial<APIInteraction>> = z.object({
		type: z.number(),
		token: z.string(),
		message: z.object({
			id: z.string(),
		}),
		data: z.object({
			component_type: z.number(),
		}),
	});

	await schema.parseAsync(interaction);

	return { interaction, isValid: true };
}
