import { BOT_ALLOWED_ROLES_ID } from '@/config/api';
import {
	discordMessage,
	getAllMessagesInDiscordChannel,
} from '@/discord/utils';
import { llmTranslateText } from '@/lib/llm/prompt-calls';
import { getContentMarkdownFromURL } from '@/lib/tool-apis';
import { waitUntil } from '@/lib/wait-until';
import { ButtonStructure, DiscordBotInteractionButtons } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import type { DiscordInteractionPostContext } from '@/types/hono';
import {
	type APIMessageComponentInteraction,
	InteractionResponseType,
	MessageType,
} from 'discord-api-types/v10';

class ReTranslationButton extends ButtonStructure {
	id = DiscordBotInteractionButtons.ReTranslate;

	allowedRoles = BOT_ALLOWED_ROLES_ID;

	async execute(
		c: DiscordInteractionPostContext,
		interaction: APIMessageComponentInteraction,
	) {
		waitUntil(this.handleLogic(c.env, interaction));

		return c.json({
			type: InteractionResponseType.DeferredMessageUpdate,
		});
	}

	async handleLogic(
		env: ServerEnv,
		interaction: APIMessageComponentInteraction,
	): Promise<void> {
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
			const allMessagesInThread = await getAllMessagesInDiscordChannel({
				token: env.DISCORD_BOT_TOKEN,
				channelId: interaction.message.channel_id,
				filter: {
					before: interaction.message.id,
				},
			});

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

			content = await getContentMarkdownFromURL(env, url);
		}

		const translation = await llmTranslateText(env, content);

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
	}
}

export default ReTranslationButton;
