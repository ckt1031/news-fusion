/**
 * Reference:
 * - https://discord.com/developers/docs/interactions/message-components#buttons
 */

import { consola } from 'consola';
import {
	ComponentType,
	InteractionResponseType,
	InteractionType,
} from 'discord-api-types/v10';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import reSummarizeButton from './interactions/buttons/re-summarize';
import reTranslateButton from './interactions/buttons/re-translate';
import summarizeButton from './interactions/buttons/summarize';
import translateButton from './interactions/buttons/translate';
import verifyDiscordRequest from './verify-request';

const app = new Hono();

app.get('/', (c) => {
	const { DISCORD_APPLICATION_ID } = env(c);
	return c.text(`👋 ${DISCORD_APPLICATION_ID}`);
});

app.post('/', async (c) => {
	c.env = env(c);
	const { isValid, interaction } = await verifyDiscordRequest(c);

	if (!isValid || !interaction) {
		return c.text('Bad request signature.', 401);
	}

	if (interaction.type === InteractionType.Ping) {
		// The `PING` message is used during the initial webhook handshake, and is
		// required to configure the webhook in the developer portal.
		return c.json({
			type: InteractionResponseType.Pong,
		});
	}

	if (interaction.type === InteractionType.MessageComponent) {
		if (!interaction.data) {
			throw new Error('No data provided');
		}

		if (interaction.data.component_type === ComponentType.Button) {
			const buttons = [
				summarizeButton,
				reSummarizeButton,
				translateButton,
				reTranslateButton,
			];

			const button = buttons.find((b) => b.id === interaction.data.custom_id);

			if (!button) {
				throw new Error(`Invalid button ID: ${interaction.data.custom_id}`);
			}

			consola.info(`Button Run: ${button.id}`);

			return await button.execute(c, interaction);
		}
	}

	throw new Error(`Invalid interaction type: ${interaction.type}`);
});

export default app;
