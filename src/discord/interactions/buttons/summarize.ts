import {
	createNewsInfoDiscordThread,
	deferUpdateInteraction,
	deleteThreadCreatedMessage,
	discordMessage,
	discordTextSplit,
} from '@/discord/utils';
import { summarizeText } from '@/lib/llm';
import { scrapeToMarkdown } from '@/lib/scrape';
import { DISCORD_INTERACTION_BUTTONS } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import {
	type APIActionRowComponent,
	type APIMessageActionRowComponent,
	type APIMessageComponentInteraction,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';

const summarizeButtonExecution = async (
	env: ServerEnv,
	interaction: APIMessageComponentInteraction,
) => {
	await deferUpdateInteraction(interaction);

	const parentMessage = interaction.message;

	if (parentMessage.embeds.length === 0 || !parentMessage.embeds[0].url) {
		throw new Error('No embeds found');
	}

	const url = parentMessage.embeds[0].url;

	const content = await scrapeToMarkdown(env, url);

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

		await discordMessage({
			env,
			method: 'POST',
			channelId: thread.id,
			body: {
				content: chunk,
				// Idk how to handle multiple messages sent later
				components: isOnlyOne ? components : [],
			},
		});
	}

	await deleteThreadCreatedMessage(env, parentMessage.channel_id);

	return {
		type: InteractionResponseType.Pong,
	};
};

export default summarizeButtonExecution;
