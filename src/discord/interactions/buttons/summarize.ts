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
import {
	createDiscordThread,
	createNewsInfoDiscordThread,
	deferUpdateInteraction,
	sendDiscordMessage,
} from '../../utils';

const summarizeButtonExecution = async (
	env: ServerEnv,
	interaction: APIMessageComponentInteraction,
) => {
	await deferUpdateInteraction(interaction);

	const parentMessage = interaction.message;

	if (parentMessage.embeds.length === 0 || !parentMessage.embeds[0].url) {
		throw new Error('No embeds found');
	}

	const url = parentMessage.embeds[0].url;

	const content = await scrapeToMarkdown(env, url);

	const text = await summarizeText(env, content);

	if (!text) {
		throw new Error('Failed to summarize content');
	}

	const thread = await createNewsInfoDiscordThread(env, interaction);

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
