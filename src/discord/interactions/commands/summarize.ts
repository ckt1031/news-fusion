import { discordMessage, discordTextSplit } from '@/discord/utils';
import { summarizeText } from '@/lib/llm/prompt-calls';
import { getContentMakrdownFromURL } from '@/lib/tool-apis';
import { waitUntil } from '@/lib/wait-until';
import { instructionIncludedPrompt } from '@/prompts/summarize';
import { CommandStructure } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import {
	type APIApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	InteractionResponseType,
	MessageFlags,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIInteractionCallbackJSONBody,
} from 'discord-api-types/v10';
import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';
import Mustache from 'mustache';

class SummarizeCommand extends CommandStructure {
	info = {
		name: 'summarize',
		description: 'Summarize articles or text.',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: 'content',
				description: 'Summarize instructions, which can be text or URLs.',
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
				content: 'Summarizing...',
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

		const urlPattern = /(https?:\/\/[^\s)]+)/g;

		const urls = content.match(urlPattern);

		const fetchedContent: {
			url: string;
			content: string;
		}[] = [];

		if (urls) {
			//getContentMakrdownFromURL
			// Use Promise.all to summarize multiple URLs
			const summaries = await Promise.all(
				urls.map((url) =>
					getContentMakrdownFromURL(env, url).then((d) => ({
						url,
						content: d,
					})),
				),
			);

			fetchedContent.push(...summaries);
		}

		const extraContent = fetchedContent
			.map(({ url, content }) => {
				return `## ${url}\n\n\`\`\`${content}\`\`\``;
			})
			.join('\n\n');

		const userPrompt = Mustache.render(instructionIncludedPrompt, {
			instructions: content,
			extraContent: urls ? extraContent : '',
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

export default SummarizeCommand;
