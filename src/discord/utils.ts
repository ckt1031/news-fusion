import {
	type APIMessage,
	type APIMessageComponentInteraction,
	InteractionResponseType,
	MessageType,
	type RESTGetAPIChannelMessageResult,
	type RESTPostAPIChannelMessageResult,
} from 'discord-api-types/v10';
import type { DiscordMessageProp } from '../types/discord';
import type { ServerEnv } from '../types/env';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

async function baseReqeust<T>(prop: {
	env?: ServerEnv;
	api: string;
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	body?: unknown;
}): Promise<T> {
	console.log(
		`Sending request to ${prop.api} with method ${prop.method}`,
		prop.body,
	);

	const headers = {
		// Set Authorization header if env is provided, some API like Interaction Callback doesn't need Authorization header
		...(prop.env ? { Authorization: `Bot ${prop.env.DISCORD_BOT_TOKEN}` } : {}),
		'Content-Type': 'application/json',
	};

	const response = await fetch(prop.api, {
		method: prop.method,
		headers,
		...(prop.body ? { body: JSON.stringify(prop.body) } : {}),
	});

	if (!response.ok) {
		// Check if it returns JSON
		if (response.headers.get('content-type')?.includes('application/json')) {
			try {
				console.error('Response Error:', await response.json());
			} catch {
				console.error(await response.text());
			}
		}

		throw new Error(`Failed to send Discord message: ${response.statusText}`);
	}

	try {
		return (await response.json()) as unknown as T;
	} catch {
		return {} as unknown as T;
	}
}

export async function getAllMessagesInDiscordChannel(
	env: ServerEnv,
	channelId: string,
	props?: {
		before?: string;
		after?: string;
		limit?: number;
	},
) {
	let api = `${DISCORD_API_BASE}/channels/${channelId}/messages`;

	// Dynamically create query string
	const query = new URLSearchParams();
	if (props?.before) query.append('before', props.before);
	if (props?.after) query.append('after', props.after);
	if (props?.limit) query.append('limit', props.limit.toString());

	if (query.toString()) {
		api += `?${query.toString()}`;
	}

	return await baseReqeust<RESTGetAPIChannelMessageResult[]>({
		env,
		api,
		method: 'GET',
	});
}

export async function discordMessage(props: DiscordMessageProp) {
	let api = `${DISCORD_API_BASE}/channels/${props.channelId}/messages`;

	if ('messageId' in props) {
		api += `/${props.messageId}`;
	}

	return await baseReqeust<APIMessage>({
		env: props.env,
		api,
		method: props.method,
		body:
			props.method === 'POST' || props.method === 'PATCH'
				? props.body
				: undefined,
	});
}

export async function deferUpdateInteraction(
	interaction: APIMessageComponentInteraction,
) {
	await baseReqeust({
		api: `${DISCORD_API_BASE}/interactions/${interaction.id}/${interaction.token}/callback`,
		method: 'POST',
		body: {
			type: InteractionResponseType.DeferredMessageUpdate,
		},
	});
}

export async function createDiscordThread(
	env: ServerEnv,
	channelId: string,
	messageId: string,
	name: string,
) {
	const api = `${DISCORD_API_BASE}/channels/${channelId}/messages/${messageId}/threads`;

	return await baseReqeust<RESTPostAPIChannelMessageResult>({
		env,
		api,
		method: 'POST',
		body: {
			name,
		},
	});
}

export async function createNewsInfoDiscordThread(
	env: ServerEnv,
	interaction: APIMessageComponentInteraction,
) {
	// Check if message has a thread
	if (interaction.message.thread) {
		return interaction.message.thread;
	}

	const thread = await createDiscordThread(
		env,
		env.DISCORD_RSS_CHANNEL_ID,
		interaction.message.id,
		'Article Info',
	);

	return thread;
}

export async function deleteThreadCreatedMessage(
	env: ServerEnv,
	channelId: string,
) {
	const messages = await getAllMessagesInDiscordChannel(env, channelId, {
		limit: 4,
	});

	for (const message of messages) {
		// Check if message.type === 18
		if (message.type !== MessageType.ThreadCreated) continue;
		await discordMessage({
			env,
			method: 'DELETE',
			channelId,
			messageId: message.id,
		});
	}
}
