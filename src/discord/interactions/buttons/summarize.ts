import {
	createNewsInfoDiscordThread,
	deleteThreadCreatedMessage,
	discordMessage,
	discordTextSplit,
} from '@/discord/utils';
import { summarizeText } from '@/lib/llm/prompt-calls';
import { getContentMakrdownFromURL } from '@/lib/tool-apis';
import { waitUntil } from '@/lib/wait-until';
import { ButtonStructure, DISCORD_INTERACTION_BUTTONS } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
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

class SummarizeButton extends ButtonStructure {
	id = DISCORD_INTERACTION_BUTTONS.GENERATE_SUMMARIZE;
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

		const text = await summarizeText(env, content);

		if (!text) {
			throw new Error('Failed to summarize content');
		}

		const chunks = await discordTextSplit(text);

		const thread = await createNewsInfoDiscordThread(env, interaction, text);

		const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Secondary,
						label: 'Regenerate',
						custom_id: DISCORD_INTERACTION_BUTTONS.REGENERATE_SUMMARIZE,
					},
					{
						type: ComponentType.Button,
						style: ButtonStyle.Secondary,
						label: 'Translate',
						custom_id: DISCORD_INTERACTION_BUTTONS.TRANSLATE,
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

		await deleteThreadCreatedMessage(
			env.DISCORD_BOT_TOKEN,
			parentMessage.channel_id,
		);
	}
}

export default new SummarizeButton();
