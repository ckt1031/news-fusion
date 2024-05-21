import { DISCORD_API_BASE } from '@/config/api';
import { generateTitle } from '@/lib/llm';
import type {
	GetOrDeleteDiscordMessageProp,
	PatchDiscordMessageProp,
	PostDiscordMessageProp,
} from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import {
	type APIMessage,
	type APIMessageComponentInteraction,
	InteractionResponseType,
	MessageType,
	type RESTGetAPIChannelMessageResult,
	type RESTPostAPIChannelMessageResult,
} from 'discord-api-types/v10';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

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

	console.debug(
		`Discord API: Sending request to ${path} with method ${method}`,
		...logBody,
	);

	const headers = {
		...(token ? { Authorization: `Bot ${token}` } : {}),
		'Content-Type': 'application/json',
	};

	const response = await fetch(`${DISCORD_API_BASE}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const contentType = response.headers.get('content-type');

		if (contentType?.includes('application/json')) {
			try {
				const errorResponse = await response.json();
				console.error('Response Error:', errorResponse);
			} catch {
				const textResponse = await response.text();
				console.error(textResponse);
			}
		}

		throw new Error(`Failed to send Discord message: ${response.statusText}`);
	}

	try {
		const jsonResponse = await response.json();
		return jsonResponse as T;
	} catch {
		return {} as T;
	}
}

export async function getAllMessagesInDiscordChannel(
	token: string,
	channelId: string,
	props?: {
		before?: string;
		after?: string;
		limit?: number;
	},
) {
	let path = `/channels/${channelId}/messages`;

	// Dynamically create query string
	const query = new URLSearchParams();
	if (props?.before) query.append('before', props.before);
	if (props?.after) query.append('after', props.after);
	if (props?.limit) query.append('limit', props.limit.toString());

	if (query.toString()) path += `?${query.toString()}`;

	return await discordBaseRequest<RESTGetAPIChannelMessageResult[]>({
		token,
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

export async function deferUpdateInteraction(
	interaction: APIMessageComponentInteraction,
) {
	await discordBaseRequest({
		path: `/interactions/${interaction.id}/${interaction.token}/callback`,
		method: 'POST',
		body: {
			type: InteractionResponseType.DeferredMessageUpdate,
		},
	});
}

export async function createDiscordThread(
	token: ServerEnv['DISCORD_BOT_TOKEN'],
	channelId: string,
	messageId: string,
	name: string,
) {
	const path = `/channels/${channelId}/messages/${messageId}/threads`;

	return await discordBaseRequest<RESTPostAPIChannelMessageResult>({
		token,
		path,
		method: 'POST',
		body: { name },
	});
}

export async function createNewsInfoDiscordThread(
	env: ServerEnv,
	interaction: APIMessageComponentInteraction,
	content: string,
) {
	// Check if message has a thread
	if (interaction.message.thread) {
		return interaction.message.thread;
	}

	let title = await generateTitle(env, content);

	if (!title) {
		title = 'Article Info';
	} else if (title.length > 100) {
		// Safe guard for title length
		title = title.slice(0, 100);
	}

	const thread = await createDiscordThread(
		env.DISCORD_BOT_TOKEN,
		env.DISCORD_RSS_CHANNEL_ID,
		interaction.message.id,
		title,
	);

	return thread;
}

export async function deleteThreadCreatedMessage(
	token: string,
	channelId: string,
) {
	const messages = await getAllMessagesInDiscordChannel(token, channelId, {
		limit: 4,
	});

	for (const message of messages) {
		// Check if message.type === 18
		if (message.type !== MessageType.ThreadCreated) continue;
		await discordMessage.delete({
			token,
			channelId,
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
