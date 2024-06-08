import { DEFAULT_EMBEDDING_MODEL } from '@/config/api';
import { discordMessage } from '@/discord/utils';
import { updateArticleDatabase } from '@/lib/db';
import { requestEmbeddingsAPI } from '@/lib/llm/api';
import { summarizeIntoShortText } from '@/lib/llm/prompt-calls';
import { getContentMakrdownFromURL } from '@/lib/tool-apis';
import { waitUntil } from '@/lib/wait-until';
import { ButtonStructure, DiscordBotInteractionButtons } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import {
	type APIMessageComponentInteraction,
	InteractionResponseType,
} from 'discord-api-types/v10';
import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';

class ReGenerateNewsNotificationButton extends ButtonStructure {
	id = DiscordBotInteractionButtons.ReGenerateNewsNotification;

	async execute(
		c: Context<Env, '/', BlankInput>,
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
	): Promise<void> {
		const parentMessage = interaction.message;

		if (parentMessage.embeds.length === 0 || !parentMessage.embeds[0]?.url) {
			throw new Error('No embeds found');
		}

		const url = parentMessage.embeds[0].url;

		const content = await getContentMakrdownFromURL(env, url);

		// Short text for embed description
		const text = await summarizeIntoShortText(env, content);

		await discordMessage.edit({
			token: env.DISCORD_BOT_TOKEN,
			channelId: interaction.channel.id,
			messageId: interaction.message.id,
			body: {
				embeds: [
					{
						...parentMessage.embeds[0],
						description: text,
					},
				],
			},
		});

		const embedding = await requestEmbeddingsAPI({
			env,
			text: content,
			model: DEFAULT_EMBEDDING_MODEL,
			timeout: 5 * 1000,
		});

		await updateArticleDatabase(env, url, {
			embedding,
		});
	}
}

export default ReGenerateNewsNotificationButton;
