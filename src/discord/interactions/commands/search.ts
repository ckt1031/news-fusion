import { discordMessage, discordTextSplit } from '@/discord/utils';
import {
	contentToSummarizePromptTemplate,
	getContentMarkdownParallel,
	getUrlFromText,
} from '@/lib/get-urls';
import { generateSearchQuery, summarizeText } from '@/lib/llm/prompt-calls';
import { webSearch } from '@/lib/tool-apis';
import { waitUntil } from '@/lib/wait-until';
import { CommandStructure } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import type { DiscordInteractionPostContext } from '@/types/hono';
import {
	type APIApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	InteractionResponseType,
	MessageFlags,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIInteractionCallbackJSONBody,
} from 'discord-api-types/v10';

class WebSearchCommand extends CommandStructure {
	info = {
		name: 'web-search',
		description: 'Search the web for information.',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: 'content',
				description: 'Any type of content or instructions to search for.',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	} satisfies RESTPostAPIApplicationCommandsJSONBody;

	async execute(
		c: DiscordInteractionPostContext,
		interaction: APIApplicationCommandInteraction,
	) {
		waitUntil(c, this.handleLogic(c.env, interaction));

		return c.json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: 'Searching the web...',
				flags: MessageFlags.Ephemeral,
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

		const content = interaction.data.options[0].value;

		const urls = getUrlFromText(content);

		async function webQuery() {
			const query = await generateSearchQuery(env, content);
			const queryResults = await webSearch(env, query);

			// Remove all existing URLs from the search results
			const filteredResults = urls
				? queryResults.filter((result) => !urls.includes(result.link))
				: queryResults;

			return await getContentMarkdownParallel(
				env,
				filteredResults.map((result) => result.link),
			);
		}

		const fetchedContent = await Promise.all([
			webQuery(),
			...(urls ? [getContentMarkdownParallel(env, urls)] : []),
		]);

		const userPrompt = contentToSummarizePromptTemplate({
			fetchedContent: fetchedContent.flat(),
			content,
		});

		const text = await summarizeText(env, userPrompt);
		const chunks = await discordTextSplit(text);

		for (const chunk of chunks) {
			await discordMessage.send({
				token: env.DISCORD_BOT_TOKEN,
				channelId: interaction.channel.id,
				body: {
					content: chunk,
				},
			});
		}
	}
}

export default WebSearchCommand;
