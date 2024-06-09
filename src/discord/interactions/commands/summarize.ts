import { discordMessage, discordTextSplit } from '@/discord/utils';
import {
	contentToSummarizePromptTemplate,
	getContentMarkdownParallel,
	getUrlFromText,
} from '@/lib/get-urls';
import { summarizeText } from '@/lib/llm/prompt-calls';
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
		c: DiscordInteractionPostContext,
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

		const urls = getUrlFromText(content);

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const fetchedContent = await getContentMarkdownParallel(env, urls!);

		const userPrompt = contentToSummarizePromptTemplate({
			fetchedContent: urls ? fetchedContent : [],
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

export default SummarizeCommand;
