import { waitUntil } from '@/lib/wait-until';
import { CommandStructure } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import {
	type APIApplicationCommandInteraction,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-interactions';
import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';

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
			type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
		});
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

		console.log(env, content);
	}
}

export default SummarizeCommand;
