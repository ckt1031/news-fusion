import { BOT_ALLOWED_ROLES_ID } from '@/config/api';
import {
	createNewsInfoDiscordThread,
	deleteThreadCreatedMessage,
	discordMessage,
	discordTextSplit,
} from '@/discord/utils';
import { summarizeText } from '@/lib/llm/prompt-calls';
import { getContentMakrdownFromURL } from '@/lib/tool-apis';
import { waitUntil } from '@/lib/wait-until';
import { ButtonStructure, DiscordBotInteractionButtons } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import type { DiscordInteractionPostContext } from '@/types/hono';
import {
	type APIActionRowComponent,
	type APIMessageActionRowComponent,
	type APIMessageComponentInteraction,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';

class SummarizeButton extends ButtonStructure {
	id = DiscordBotInteractionButtons.Summarize;

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
		const parentMessage = interaction.message;

		if (parentMessage.embeds.length === 0 || !parentMessage.embeds[0]?.url) {
			throw new Error('No embeds found');
		}

		const url = parentMessage.embeds[0].url;

		const content = await getContentMakrdownFromURL(env, url);

		const text = await summarizeText(env, content);

		if (!text) {
			throw new Error('Failed to summarize content');
		}

		const chunks = await discordTextSplit(text);

		const thread = await createNewsInfoDiscordThread({
			env: env,
			interaction: interaction,
			content: text,
		});

		const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Secondary,
						label: 'Regenerate',
						custom_id: DiscordBotInteractionButtons.ReSummarize,
					},
					{
						type: ComponentType.Button,
						style: ButtonStyle.Secondary,
						label: 'Translate',
						custom_id: DiscordBotInteractionButtons.Translate,
					},
				],
			},
		];

		for (const chunk of chunks) {
			const isOnlyOne = chunks.length === 1;

			await discordMessage.send({
				token: env.DISCORD_BOT_TOKEN,
				channelId: thread.id,
				body: {
					content: chunk,
					// Idk how to handle multiple messages sent later
					components: isOnlyOne ? components : [],
				},
			});
		}

		await deleteThreadCreatedMessage({
			token: env.DISCORD_BOT_TOKEN,
			channelId: parentMessage.channel_id,
		});
	}
}

export default SummarizeButton;
