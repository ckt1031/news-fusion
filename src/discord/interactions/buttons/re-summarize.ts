import { InteractionResponseType, MessageType } from 'discord-api-types/v10';
import { summarizeText } from '../../../lib/llm';
import { scrapeToMarkdown } from '../../../lib/scrape';
import type { InteractionExecution } from '../../../types/discord';
import type { ServerEnv } from '../../../types/env';
import {
	deferUpdateInteraction,
	discordMessage,
	getAllMessagesInDiscordChannel,
} from '../../utils';

const reSummarizeButtonExecution = async (
	env: ServerEnv,
	interaction: InteractionExecution,
) => {
	await deferUpdateInteraction(interaction);

	const allMessagesInThread = await getAllMessagesInDiscordChannel(
		env,
		interaction.message.channel_id,
		{
			before: interaction.message.id,
		},
	);

	// Find one that message.type === MessageType.ThreadStarterMessage
	const parentMessage = allMessagesInThread.find(
		(msg) => msg.type === MessageType.ThreadStarterMessage,
	)?.referenced_message;

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

	// Edit the message with the new summarized text
	await discordMessage({
		env,
		method: 'PATCH',
		channelId: interaction.message.channel_id,
		messageId: interaction.message.id,
		body: {
			content: text,
		},
	});

	return {
		type: InteractionResponseType.Pong,
	};
};

export default reSummarizeButtonExecution;
