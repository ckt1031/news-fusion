import {
	type APIMessageComponentInteraction,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { summarizeText } from '../../../lib/llm';
import { scrapeToMarkdown } from '../../../lib/scrape';
import type { ServerEnv } from '../../../types/env';
import {
	deferUpdateInteraction,
	editDiscordMessage,
	getAllMessagesInDiscordChannel,
} from '../../utils';

const reSummarizeButtonExecution = async (
	env: ServerEnv,
	interaction: APIMessageComponentInteraction,
) => {
	await deferUpdateInteraction(interaction);

	if (!interaction.data) {
		throw new Error('No data provided');
	}

	if (interaction.data.component_type !== ComponentType.Button) {
		throw new Error('Invalid component type');
	}

	const allMessagesInThread = await getAllMessagesInDiscordChannel(
		env,
		interaction.message.channel_id,
		{
			before: interaction.message.id,
		},
	);

	const parentMessage = allMessagesInThread[0].referenced_message;

	if (
		!parentMessage ||
		parentMessage.embeds.length === 0 ||
		!parentMessage.embeds[0].url
	) {
		throw new Error('No embeds found');
	}

	const url = parentMessage.embeds[0].url;

	const content = await scrapeToMarkdown(env, url);

	const text = await summarizeText(env, content);

	if (!text) {
		throw new Error('Failed to summarize content');
	}

	await editDiscordMessage(
		env,
		interaction.message.channel_id,
		interaction.message.id,
		{
			content: text,
		},
	);

	return {
		type: InteractionResponseType.Pong,
	};
};

export default reSummarizeButtonExecution;
