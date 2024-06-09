import { DEFAULT_EMBEDDING_MODEL } from '@/config/api';
import { editInteractionResponse } from '@/discord/utils';
import { getContentMarkdownParallel } from '@/lib/get-urls';
import { requestEmbeddingsAPI } from '@/lib/llm/api';
import { isArticleSimilar } from '@/lib/news/similarity';
import { waitUntil } from '@/lib/wait-until';
import { CommandStructure } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import consola from 'consola';
import {
	type APIApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	InteractionResponseType,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIInteractionCallbackJSONBody,
} from 'discord-api-types/v10';
import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';

class FindSimilarArtilesCommand extends CommandStructure {
	info = {
		name: 'find-similar',
		description: 'Find similar articles from the given URL.',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: 'url',
				description: 'URL of the article to find similar articles.',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	} satisfies RESTPostAPIApplicationCommandsJSONBody;

	async execute(
		c: Context<Env, '/', BlankInput>,
		interaction: APIApplicationCommandInteraction,
	) {
		waitUntil(c, this.handleLogic(c.env, interaction));

		return c.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: 'Fetching similar articles...',
			},
		} satisfies RESTPostAPIInteractionCallbackJSONBody);
	}

	async handleLogic(
		env: ServerEnv,
		interaction: APIApplicationCommandInteraction,
	) {
		if (
			interaction.data.type !== ApplicationCommandType.ChatInput ||
			!interaction.data.options ||
			!interaction.data.options[0]
		) {
			throw new Error('Invalid interaction type');
		}
		if (
			interaction.data.options[0].type !== ApplicationCommandOptionType.String
		) {
			throw new Error('Invalid option type');
		}
		const url = interaction.data.options[0].value;

		// Check if the content is a URL
		if (url.length === 0 || url.startsWith('http')) {
			await editInteractionResponse(
				interaction.id,
				env.DISCORD_APPLICATION_ID,
				{
					content: 'Invalid URL.',
				},
			);
			consola.error('Invalid URL', url);
			return;
		}

		const fetchedContent = (await getContentMarkdownParallel(env, [url]))[0];

		if (!fetchedContent) {
			await editInteractionResponse(
				interaction.id,
				env.DISCORD_APPLICATION_ID,
				{
					content: 'Failed to fetch content.',
				},
			);
			return;
		}

		const embedding = await requestEmbeddingsAPI({
			env,
			text: fetchedContent.content,
			model: DEFAULT_EMBEDDING_MODEL,
		});

		const similar = await isArticleSimilar(env, embedding, url);

		await editInteractionResponse(interaction.id, env.DISCORD_APPLICATION_ID, {
			content: similar.result
				? 'Similar articles found.'
				: 'No similar articles found.',
			embeds: [
				{
					title: 'Similar Articles',
					fields: similar.similarities.map((article) => ({
						name: `${article.name} (${article.similarity.toFixed(2)})`,
						value: article.url,
					})),
				},
			],
		});
	}
}

export default FindSimilarArtilesCommand;
