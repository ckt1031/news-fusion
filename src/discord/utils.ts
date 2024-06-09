import { DISCORD_API_BASE } from '@/config/api';
import { generateTitle } from '@/lib/llm/prompt-calls';
import type {
	GetOrDeleteDiscordMessageProp,
	PatchDiscordMessageProp,
	PostDiscordMessageProp,
} from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import consola from 'consola';
import {
	type APIMessage,
	type APIMessageComponentInteraction,
	MessageType,
	type RESTGetAPIApplicationGuildCommandsResult,
	type RESTGetAPIChannelMessageResult,
	type RESTPatchAPIWebhookWithTokenMessageJSONBody,
	type RESTPostAPIApplicationCommandsJSONBody,
	type RESTPostAPIChannelMessageResult,
} from 'discord-api-types/v10';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ofetch } from 'ofetch';

type BaseReqeustProp = {
	token?: string;
	path: string;
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	body?: Record<any, any>;
};

async function discordBaseRequest<T>({
	token,
	path,
	method,
	body,
}: BaseReqeustProp): Promise<T> {
	const logBody = body ? [body] : [];

	consola.start(
		`Discord API: Sending request to ${path} with method ${method}`,
		...logBody,
	);

	const headers = {
		...(token ? { Authorization: `Bot ${token}` } : {}),
		'Content-Type': 'application/json',
	};

	const response = await ofetch<T>(`${DISCORD_API_BASE}${path}`, {
		method,
		headers,
		body,
		timeout: 3000, // Timeout after 3 seconds
	});

	return response;
}

type EditInteractionResponseProp = {
	interactionToken: string;
	applicationId: string;
	body: RESTPatchAPIWebhookWithTokenMessageJSONBody;
};

export async function editInteractionResponse(
	props: EditInteractionResponseProp,
) {
	return await discordBaseRequest<APIMessage>({
		path: `/webhooks/${props.applicationId}/${props.interactionToken}/messages/@original`,
		method: 'PATCH',
		body: props.body,
	});
}

interface RegisterGlobalCommandsProp {
	token: string;
	applicationId: string;
	guildId: string;
	command: RESTPostAPIApplicationCommandsJSONBody;
}

export async function registerGuildCommands(d: RegisterGlobalCommandsProp) {
	return await discordBaseRequest<RESTPostAPIApplicationCommandsJSONBody[]>({
		token: d.token,
		path: `/applications/${d.applicationId}/guilds/${d.guildId}/commands`,
		method: 'POST',
		body: d.command,
	});
}

interface DeleteAllGuildCommandsProp {
	token: string;
	applicationId: string;
	guildId: string;
}

export async function deleteAllGuildCommands(d: DeleteAllGuildCommandsProp) {
	const commands =
		await discordBaseRequest<RESTGetAPIApplicationGuildCommandsResult>({
			token: d.token,
			path: `/applications/${d.applicationId}/guilds/${d.guildId}/commands`,
			method: 'GET',
		});

	for (const command of commands) {
		await discordBaseRequest({
			token: d.token,
			path: `/applications/${d.applicationId}/guilds/${d.guildId}/commands/${command.id}`,
			method: 'DELETE',
		});
	}
}

interface GetAllMessagesInDiscordChannelProp {
	token: string;
	channelId: string;
	filter?: {
		before?: string;
		after?: string;
		limit?: number;
	};
}

export async function getAllMessagesInDiscordChannel(
	d: GetAllMessagesInDiscordChannelProp,
) {
	let path = `/channels/${d.channelId}/messages`;

	// Dynamically create query string
	const query = new URLSearchParams();
	if (d.filter?.before) query.append('before', d.filter.before);
	if (d.filter?.after) query.append('after', d.filter.after);
	if (d.filter?.limit) query.append('limit', d.filter.limit.toString());

	if (query.toString()) path += `?${query.toString()}`;

	return await discordBaseRequest<RESTGetAPIChannelMessageResult[]>({
		token: d.token,
		path,
		method: 'GET',
	});
}

export const discordMessage = {
	// POST
	send: async (props: PostDiscordMessageProp) => {
		return await discordBaseRequest<APIMessage>({
			token: props.token,
			path: `/channels/${props.channelId}/messages`,
			method: 'POST',
			body: props.body,
		});
	},
	delete: async (props: GetOrDeleteDiscordMessageProp) => {
		return await discordBaseRequest<APIMessage>({
			token: props.token,
			path: `/channels/${props.channelId}/messages/${props.messageId}`,
			method: 'DELETE',
		});
	},
	get: async (props: GetOrDeleteDiscordMessageProp) => {
		return await discordBaseRequest<APIMessage>({
			token: props.token,
			path: `/channels/${props.channelId}/messages/${props.messageId}`,
			method: 'GET',
		});
	},
	edit: async (props: PatchDiscordMessageProp) => {
		return await discordBaseRequest<APIMessage>({
			token: props.token,
			path: `/channels/${props.channelId}/messages/${props.messageId}`,
			method: 'PATCH',
			body: props.body,
		});
	},
};

interface CreateDiscordThreadProp {
	token: string;
	channelId: string;
	messageId: string;
	name: string;
}

export async function createDiscordThread(d: CreateDiscordThreadProp) {
	const path = `/channels/${d.channelId}/messages/${d.messageId}/threads`;

	return await discordBaseRequest<RESTPostAPIChannelMessageResult>({
		token: d.token,
		path,
		method: 'POST',
		body: { name: d.name },
	});
}

interface CreateNewsInfoDiscordThreadProp {
	env: ServerEnv;
	interaction: APIMessageComponentInteraction;
	content: string;
}

export async function createNewsInfoDiscordThread(
	d: CreateNewsInfoDiscordThreadProp,
) {
	// Check if message has a thread
	if (d.interaction.message.thread) {
		return d.interaction.message.thread;
	}

	let title = await generateTitle(d.env, d.content);

	if (!title) {
		title = 'Article Info';
	} else if (title.length > 100) {
		// Safe guard for title length
		title = title.slice(0, 100);
	}

	const thread = await createDiscordThread({
		token: d.env.DISCORD_BOT_TOKEN,
		channelId: d.interaction.channel_id,
		messageId: d.interaction.message.id,
		name: title,
	});

	return thread;
}

interface DeleteThreadCreatedMessageProp {
	token: string;
	channelId: string;
}

export async function deleteThreadCreatedMessage(
	d: DeleteThreadCreatedMessageProp,
) {
	const messages = await getAllMessagesInDiscordChannel({
		token: d.token,
		channelId: d.channelId,
		filter: {
			limit: 4,
		},
	});

	for (const message of messages) {
		// Check if message.type === 18
		if (message.type !== MessageType.ThreadCreated) continue;
		await discordMessage.delete({
			token: d.token,
			channelId: d.channelId,
			messageId: message.id,
		});
	}
}

export async function discordTextSplit(text: string): Promise<string[]> {
	if (text.length < 1990) return [text];

	const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
		chunkSize: 1500,
		chunkOverlap: 0,
	});

	const output = await splitter.createDocuments([text]);

	return output.map((doc) => doc.pageContent);
}
