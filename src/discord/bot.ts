import { DISCORD_INTERACTION_BUTTONS } from '@/types/discord';
import {
	ComponentType,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
} from 'discord-api-types/v10';
import { Hono } from 'hono';
import { getRequestExecutionContext } from '../lib/get-execution-ctx';
import reSummarizeButtonExecution from './interactions/buttons/re-summarize';
import reTranslateButtonExecution from './interactions/buttons/re-translate';
import summarizeButtonExecution from './interactions/buttons/summarize';
import translateButtonExecution from './interactions/buttons/translate';
import verifyDiscordRequest from './verify-request';

const app = new Hono();

// Reference: https://github.com/discord/cloudflare-sample-app/blob/main/src/server.js

app.get('/', (c) => {
	return c.text(`👋 ${c.env.DISCORD_APPLICATION_ID}`);
});

app.post('/', async (c) => {
	c.set('ctx', getRequestExecutionContext());

	const handleError = (error: unknown) => {
		console.error(error);
		return c.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: error instanceof Error ? error.message : 'An error occurred',
				flags: MessageFlags.Ephemeral,
			},
		});
	};

	try {
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
				try {
					let response = {};

					switch (interaction.data.custom_id) {
						case DISCORD_INTERACTION_BUTTONS.GENERATE_SUMMARIZE: {
							response = await summarizeButtonExecution(c, interaction);
							break;
						}
						case DISCORD_INTERACTION_BUTTONS.REGENERATE_SUMMARIZE: {
							response = await reSummarizeButtonExecution(c.env, interaction);
							break;
						}
						case DISCORD_INTERACTION_BUTTONS.TRANSLATE: {
							response = await translateButtonExecution(c.env, interaction);
							break;
						}
						case DISCORD_INTERACTION_BUTTONS.RE_TRANSLATE: {
							response = await reTranslateButtonExecution(c.env, interaction);
							break;
						}
						default: {
							throw new Error('Unknown button');
						}
					}

					return c.json(response);
				} catch (error) {
					return handleError(error);
				}
			}
		}

		throw new Error('Invalid interaction type');
	} catch (error) {
		return handleError(error);
	}
});

export default app;
