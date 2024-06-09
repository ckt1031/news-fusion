import {
	discordMessage,
	getAllMessagesInDiscordChannel,
} from '@/discord/utils';
import { summarizeText } from '@/lib/llm/prompt-calls';
import { getContentMakrdownFromURL } from '@/lib/tool-apis';
import { waitUntil } from '@/lib/wait-until';
import { ButtonStructure, DiscordBotInteractionButtons } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import type { DiscordInteractionPostContext } from '@/types/hono';
import type { APIMessageComponentInteraction } from 'discord-api-types/v10';
import { InteractionResponseType, MessageType } from 'discord-api-types/v10';

class ReSummarizeButton extends ButtonStructure {
	id = DiscordBotInteractionButtons.ReSummarize;
	async execute(
		c: DiscordInteractionPostContext,
		interaction: APIMessageComponentInteraction,
	) {
		waitUntil(c, this.handleLogic(c.env, interaction));

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
			!parentMessage.embeds[0]?.url
		) {
			throw new Error('No embeds found');
		}

		const url = parentMessage.embeds[0].url;

		const content = await getContentMakrdownFromURL(env, url);

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

export default ReSummarizeButton;
