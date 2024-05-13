import {
	type APIMessageComponentInteraction,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { summarizeText } from '../../../lib/llm';
import { scrapeToMarkdown } from '../../../lib/scrape';
import { DISCORD_INTERACTION_BUTTONS } from '../../../types/discord';
import type { ServerEnv } from '../../../types/env';
import { createDiscordThread, sendDiscordMessage } from '../../utils';

const summarizeButtonExecution = async (
	env: ServerEnv,
	interactions: APIMessageComponentInteraction,
) => {
	await fetch(
		`https://discord.com/api/v10/interactions/${interactions.id}/${interactions.token}/callback`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: InteractionResponseType.DeferredMessageUpdate,
			}),
		},
	);

	if (!interactions.data) {
		throw new Error('No data provided');
	}

	if (interactions.data.component_type !== ComponentType.Button) {
		throw new Error('Invalid component type');
	}

	const parentMessage = interactions.message;

	if (parentMessage.embeds.length === 0 || !parentMessage.embeds[0].url) {
		throw new Error('No embeds found');
	}

	const url = parentMessage.embeds[0].url;

	const content = await scrapeToMarkdown(env, url);

	const text = await summarizeText(env, content);

	if (!text) {
		throw new Error('Failed to summarize content');
	}

	const thread = await createDiscordThread(
		env,
		env.DISCORD_RSS_CHANNEL_ID,
		parentMessage.id,
		'Summary',
	);

	await sendDiscordMessage(env, thread.id, {
		content: text,
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Secondary,
						label: 'Regenerate',
						custom_id: DISCORD_INTERACTION_BUTTONS.REGENERATE_SUMMARIZE,
					},
					{
						type: ComponentType.Button,
						style: ButtonStyle.Secondary,
						label: 'Translate',
						custom_id: DISCORD_INTERACTION_BUTTONS.TRANSLATE,
					},
				],
			},
		],
	});

	return {
		type: InteractionResponseType.Pong,
	};
};

export default summarizeButtonExecution;
