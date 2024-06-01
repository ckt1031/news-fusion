import {
	discordMessage,
	getAllMessagesInDiscordChannel,
} from '@/discord/utils';
import { translateText } from '@/lib/llm';
import { scrapeToMarkdown } from '@/lib/scrape';
import type { ServerEnv } from '@/types/env';
import {
	type APIMessageComponentInteraction,
	InteractionResponseType,
	MessageType,
} from 'discord-api-types/v10';
import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';

const handleReTranslation = async (
	env: ServerEnv,
	interaction: APIMessageComponentInteraction,
) => {
	let content = '';

	const refMsg = (
		await discordMessage.get({
			token: env.DISCORD_BOT_TOKEN,
			channelId: interaction.message.channel_id,
			messageId: interaction.message.id,
		})
	).referenced_message;

	if (refMsg) {
		// This is replied message, so use the content of the replied message
		content = refMsg.content;
	} else {
		const allMessagesInThread = await getAllMessagesInDiscordChannel(
			env.DISCORD_BOT_TOKEN,
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
	await discordMessage.edit({
		token: env.DISCORD_BOT_TOKEN,
		channelId: interaction.message.channel_id,
		messageId: interaction.message.id,
		body: {
			content: translation,
		},
	});
};

const reTranslateButtonExecution = async (
	c: Context<Env, '/', BlankInput>,
	interaction: APIMessageComponentInteraction,
) => {
	c.executionCtx.waitUntil(handleReTranslation(c.env, interaction));

	return {
		type: InteractionResponseType.DeferredMessageUpdate,
	};
};

export default reTranslateButtonExecution;
