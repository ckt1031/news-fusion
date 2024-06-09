import type {
	APIMessageApplicationCommandInteraction,
	APIMessageComponentInteraction,
	APIMessageComponentInteractionData,
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChannelMessageJSONBody,
} from 'discord-api-types/v10';
import type { TypedResponse } from 'hono/types';
import type { ServerEnv } from './env';
import type { DiscordInteractionPostContext } from './hono';

export enum DiscordBotInteractionButtons {
	Summarize = 'summarize',
	Translate = 'translate',

	// Re-try buttons
	ReTranslate = 're_translate',
	ReSummarize = 'regenerate_summarize',
	ReGenerateNewsNotification = 'regenerate_news_notification',
}

export interface InteractionExecution extends APIMessageComponentInteraction {
	data: APIMessageComponentInteractionData;
}

export interface BaseDiscordMessageProp {
	token: ServerEnv['DISCORD_BOT_TOKEN'];
	channelId: string;
}

export interface GetOrDeleteDiscordMessageProp extends BaseDiscordMessageProp {
	messageId: string;
}

export interface PostDiscordMessageProp extends BaseDiscordMessageProp {
	body: RESTPostAPIChannelMessageJSONBody;
}

export interface PatchDiscordMessageProp extends BaseDiscordMessageProp {
	messageId: string;
	body: RESTPostAPIChannelMessageJSONBody;
}

export type DiscordMessageProp =
	| GetOrDeleteDiscordMessageProp
	| PostDiscordMessageProp
	| PatchDiscordMessageProp;

export abstract class CommandStructure {
	info!: RESTPostAPIApplicationCommandsJSONBody;
	abstract execute(
		c: DiscordInteractionPostContext,
		interaction: APIMessageApplicationCommandInteraction,
	): Promise<TypedResponse>;
	abstract handleLogic(
		env: ServerEnv,
		interaction: APIMessageApplicationCommandInteraction,
	): Promise<void>;
}

export abstract class ButtonStructure {
	readonly id!: DiscordBotInteractionButtons;
	abstract execute(
		c: DiscordInteractionPostContext,
		interaction: APIMessageComponentInteraction,
	): Promise<TypedResponse>;
	abstract handleLogic(
		env: ServerEnv,
		interaction: APIMessageComponentInteraction,
	): Promise<void>;
}
