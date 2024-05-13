import {
	type APIActionRowComponent,
	type APIMessageActionRowComponent,
	type APIMessageComponentInteraction,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { translateText } from '../../../lib/llm';
import { scrapeToMarkdown } from '../../../lib/scrape';
import { DISCORD_INTERACTION_BUTTONS } from '../../../types/discord';
import type { ServerEnv } from '../../../types/env';
import {
	createDiscordThread,
	deferUpdateInteraction,
	sendDiscordMessage,
} from '../../utils';

const translateButtonExecution = async (
	env: ServerEnv,
	interaction: APIMessageComponentInteraction,
) => {
	await deferUpdateInteraction(interaction);

	const messageComponents: APIActionRowComponent<APIMessageActionRowComponent>[] =
		[
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Secondary,
						label: 'Re-translate',
						custom_id: DISCORD_INTERACTION_BUTTONS.RE_TRANSLATE,
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

		await sendDiscordMessage(env, interaction.message.channel_id, {
			content: translation,
			message_reference: {
				message_id: interaction.message.id,
				channel_id: interaction.message.channel_id,
			},
			components: messageComponents,
		});
	}

	// Check if message has embed
	if (interaction.message.embeds.length > 0) {
		// Use Embed URL to translate
		const url = interaction.message.embeds[0].url;

		if (!url) {
			throw new Error('No URL found');
		}

		const content = await scrapeToMarkdown(env, url);

		const translation = await translateText(env, content);

		if (!translation) {
			throw new Error('Failed to translate content');
		}

		// Send to thread
		const thread = await createDiscordThread(
			env,
			env.DISCORD_RSS_CHANNEL_ID,
			interaction.message.id,
			'Translation',
		);

		await sendDiscordMessage(env, thread.id, {
			content: translation,
			components: messageComponents,
		});
	}

	return {
		type: InteractionResponseType.Pong,
	};
};

export default translateButtonExecution;
