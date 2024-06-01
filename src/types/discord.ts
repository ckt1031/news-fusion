import type {
	APIMessageApplicationCommandInteraction,
	APIMessageComponentInteraction,
	APIMessageComponentInteractionData,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChannelMessageJSONBody,
} from 'discord-api-types/v10';
import type { Context, Env } from 'hono';
import type { BlankInput, TypedResponse } from 'hono/types';
import type { ServerEnv } from './env';

export enum DISCORD_INTERACTION_BUTTONS {
	GENERATE_SUMMARIZE = 'summarize',
	REGENERATE_SUMMARIZE = 'regenerate_summarize',
	TRANSLATE = 'translate',
	RE_TRANSLATE = 're_translate',
}

export type InteractionExecution = APIMessageComponentInteraction & {
	data: APIMessageComponentInteractionData;
};

export type BaseDiscordMessageProp = {
	token: ServerEnv['DISCORD_BOT_TOKEN'];
	channelId: string;
};

export type GetOrDeleteDiscordMessageProp = BaseDiscordMessageProp & {
	messageId: string;
};

export type PostDiscordMessageProp = BaseDiscordMessageProp & {
	body: RESTPostAPIChannelMessageJSONBody;
};

export type PatchDiscordMessageProp = BaseDiscordMessageProp & {
	messageId: string;
	body: RESTPostAPIChannelMessageJSONBody;
};

export type DiscordMessageProp =
	| GetOrDeleteDiscordMessageProp
	| PostDiscordMessageProp
	| PatchDiscordMessageProp;

export abstract class CommandStructure {
	info!: RESTPostAPIApplicationCommandsJSONBody;
	abstract execute(
		c: Context<Env, '/', BlankInput>,
		interaction: APIMessageApplicationCommandInteraction,
	): Promise<unknown>;
	abstract handleLogic(
		env: ServerEnv,
		interaction: APIMessageApplicationCommandInteraction,
	): Promise<void>;
}

export abstract class ButtonStructure {
	id!: DISCORD_INTERACTION_BUTTONS;
	abstract execute(
		c: Context<Env, '/', BlankInput>,
		interaction: APIMessageComponentInteraction,
	): Promise<TypedResponse>;
	abstract handleLogic(
		env: ServerEnv,
		interaction: APIMessageComponentInteraction,
	): Promise<void>;
}
