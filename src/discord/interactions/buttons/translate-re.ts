import {
	type APIMessageComponentInteraction,
	InteractionResponseType,
	MessageType,
} from 'discord-api-types/v10';
import { translateText } from '../../../lib/llm';
import { scrapeToMarkdown } from '../../../lib/scrape';
import type { ServerEnv } from '../../../types/env';
import {
	deferUpdateInteraction,
	discordMessage,
	getAllMessagesInDiscordChannel,
} from '../../utils';

const reTranslateButtonExecution = async (
	env: ServerEnv,
	interaction: APIMessageComponentInteraction,
) => {
	await deferUpdateInteraction(interaction);

	let content = '';

	const refMsg = (
		await discordMessage({
			env,
			method: 'GET',
			channelId: interaction.message.channel_id,
			messageId: interaction.message.id,
		})
	).referenced_message;

	if (refMsg) {
		// This is replied message, so use the content of the replied message
		content = refMsg.content;
	} else {
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

		content = await scrapeToMarkdown(env, url);
	}

	const translation = await translateText(env, content);

	if (!translation) {
		throw new Error('Failed to translate content');
	}

	// Edit the message with the new translated text
	await discordMessage({
		env,
		method: 'PATCH',
		channelId: interaction.message.channel_id,
		messageId: interaction.message.id,
		body: {
			content: translation,
		},
	});

	return {
		type: InteractionResponseType.Pong,
	};
};

export default reTranslateButtonExecution;
