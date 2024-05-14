import type {
	APIMessageComponentInteraction,
	APIMessageComponentInteractionData,
	RESTPostAPIChannelMessageJSONBody,
} from 'discord-api-types/v10';
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

type BaseDiscordMessageProp = {
	env: ServerEnv;
	channelId: string;
};

type GetOrDeleteDiscordMessageProp = BaseDiscordMessageProp & {
	method: 'GET' | 'DELETE';
	messageId: string;
};

type PostDiscordMessageProp = BaseDiscordMessageProp & {
	method: 'POST';
	body: RESTPostAPIChannelMessageJSONBody;
};

type PatchDiscordMessageProp = BaseDiscordMessageProp & {
	method: 'PATCH';
	messageId: string;
	body: RESTPostAPIChannelMessageJSONBody;
};

export type DiscordMessageProp =
	| GetOrDeleteDiscordMessageProp
	| PostDiscordMessageProp
	| PatchDiscordMessageProp;
