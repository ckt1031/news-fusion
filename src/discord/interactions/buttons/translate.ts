import {
	createNewsInfoDiscordThread,
	deleteThreadCreatedMessage,
	discordMessage,
	discordTextSplit,
} from '@/discord/utils';
import { translateText } from '@/lib/llm/prompt-calls';
import { getContentMakrdownFromURL } from '@/lib/tool-apis';
import { waitUntil } from '@/lib/wait-until';
import { ButtonStructure, DiscordBotInteractionButtons } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import consola from 'consola';
import {
	type APIActionRowComponent,
	type APIMessageActionRowComponent,
	type APIMessageComponentInteraction,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';

class TranslateButton extends ButtonStructure {
	id = DiscordBotInteractionButtons.Translate;
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
		const messageComponents: APIActionRowComponent<APIMessageActionRowComponent>[] =
			[
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Secondary,
							label: 'Re-translate',
							custom_id: DiscordBotInteractionButtons.ReTranslate,
						},
					],
				},
			];

		// Check if message has content
		if (interaction.message.content.length > 0) {
			// Use message content to translate
			const content = interaction.message.content;

			const translation = await translateText(env, content);

			if (!translation) {
				throw new Error('Failed to translate content');
			}

			await discordMessage.send({
				token: env.DISCORD_BOT_TOKEN,
				channelId: interaction.message.channel_id,
				body: {
					content: translation,
					message_reference: {
						message_id: interaction.message.id,
						channel_id: interaction.message.channel_id,
					},
					components: messageComponents,
				},
			});
		}

		// Check if message has embed
		if (interaction.message.embeds.length > 0) {
			// Use Embed URL to translate
			const url = interaction.message.embeds[0]?.url;

			if (!url) {
				throw new Error('No URL found');
			}

			const content = await getContentMakrdownFromURL(env, url);

			const translation = await translateText(env, content);

			if (!translation) {
				throw new Error('Failed to translate content');
			}

			consola.info('AI Translation:', translation);

			const chunks = await discordTextSplit(translation);

			// Send to thread
			const thread = await createNewsInfoDiscordThread(
				env,
				interaction,
				content,
			);

			for (const chunk of chunks) {
				const isOnlyOne = chunks.length === 1;

				await discordMessage.send({
					token: env.DISCORD_BOT_TOKEN,
					channelId: thread.id,
					body: {
						content: chunk,
						// Idk how to handle multiple messages sent later
						components: isOnlyOne ? messageComponents : [],
					},
				});
			}

			await deleteThreadCreatedMessage(
				env.DISCORD_BOT_TOKEN,
				interaction.message.channel_id,
			);
		}
	}
}

export default TranslateButton;
