import {
	discordMessage,
	getAllMessagesInDiscordChannel,
} from '@/discord/utils';
import { summarizeText } from '@/lib/llm/prompt-calls';
import { scrapeToMarkdown } from '@/lib/scrape';
import {
	ButtonStructure,
	type DISCORD_INTERACTION_BUTTONS,
} from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import type { APIMessageComponentInteraction } from 'discord-api-types/v10';
import { InteractionResponseType, MessageType } from 'discord-api-types/v10';

import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';

class ReSummarizeButton extends ButtonStructure {
	declare id: DISCORD_INTERACTION_BUTTONS.REGENERATE_SUMMARIZE;
	async execute(
		c: Context<Env, '/', BlankInput>,
		interaction: APIMessageComponentInteraction,
	) {
		c.executionCtx.waitUntil(this.handleLogic(c.env, interaction));

		return c.json({
			type: InteractionResponseType.DeferredMessageUpdate,
		});
	}

	async handleLogic(
		env: ServerEnv,
		interaction: APIMessageComponentInteraction,
	) {
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

		const content = await scrapeToMarkdown(env, url);

		const text = await summarizeText(env, content);

		if (!text) {
			throw new Error('Failed to summarize content');
		}

		// Edit the message with the new summarized text
		await discordMessage.edit({
			token: env.DISCORD_BOT_TOKEN,
			channelId: interaction.message.channel_id,
			messageId: interaction.message.id,
			body: {
				content: text,
			},
		});
	}
}

export default new ReSummarizeButton();
