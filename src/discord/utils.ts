import {
	type APIMessageComponentInteraction,
	InteractionResponseType,
	type RESTGetAPIChannelMessageResult,
	type RESTGetAPIChannelResult,
	type RESTPostAPIChannelMessageJSONBody,
	type RESTPostAPIChannelMessageResult,
} from 'discord-api-types/v10';
import type { ServerEnv } from '../types/env';

const discordAPIBaseURL = 'https://discord.com/api/v10';

export async function getAllMessagesInDiscordChannel(
	env: ServerEnv,
	channelId: string,
	props?: {
		before?: string;
		after?: string;
		limit?: number;
	},
) {
	let api = `${discordAPIBaseURL}/channels/${channelId}/messages`;

	// Dynamically create query string
	const query = new URLSearchParams();
	if (props?.before) query.append('before', props.before);
	if (props?.after) query.append('after', props.after);
	if (props?.limit) query.append('limit', props.limit.toString());

	if (query.toString()) {
		api += `?${query.toString()}`;
	}

	const headers = {
		Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
		'Content-Type': 'application/json',
	};

	const response = await fetch(api, {
		method: 'GET',
		headers,
	});

	if (!response.ok) {
		throw new Error(`Failed to send Discord message: ${response.statusText}`);
	}

	return response.json() as unknown as RESTGetAPIChannelMessageResult[];
}

export async function editDiscordMessage(
	env: ServerEnv,
	channelId: string,
	messageId: string,
	messageBody: Partial<RESTPostAPIChannelMessageJSONBody>,
) {
	const api = `${discordAPIBaseURL}/channels/${channelId}/messages/${messageId}`;
	const headers = {
		Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
		'Content-Type': 'application/json',
	};

	const body = JSON.stringify(messageBody);
	const response = await fetch(api, {
		method: 'PATCH',
		headers,
		body,
	});

	if (!response.ok) {
		throw new Error(`Failed to send Discord message: ${response.statusText}`);
	}

	return response.json() as unknown as RESTPostAPIChannelMessageResult;
}

export async function sendDiscordMessage(
	env: ServerEnv,
	channelId: string,
	messageBody: RESTPostAPIChannelMessageJSONBody,
) {
	const api = `${discordAPIBaseURL}/channels/${channelId}/messages`;
	const headers = {
		Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
		'Content-Type': 'application/json',
	};

	const response = await fetch(api, {
		method: 'POST',
		headers,
		body: JSON.stringify(messageBody),
	});

	if (!response.ok) {
		throw new Error(`Failed to send Discord message: ${response.statusText}`);
	}

	return response.json() as unknown as RESTPostAPIChannelMessageResult;
}

export async function getDiscordMessage(
	env: ServerEnv,
	channelId: string,
	messageId: string,
) {
	const api = `${discordAPIBaseURL}/channels/${channelId}/messages/${messageId}`;
	const headers = {
		Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
		'Content-Type': 'application/json',
	};
	const response = await fetch(api, { method: 'GET', headers });

	if (!response.ok) {
		throw new Error(`Failed to get Discord message: ${response.statusText}`);
	}

	return response.json() as unknown as RESTGetAPIChannelMessageResult;
}

export async function deferUpdateInteraction(
	interaction: APIMessageComponentInteraction,
) {
	await fetch(
		`${discordAPIBaseURL}/interactions/${interaction.id}/${interaction.token}/callback`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: InteractionResponseType.DeferredMessageUpdate,
			}),
		},
	);
}

export async function createDiscordThread(
	env: ServerEnv,
	channelId: string,
	messageId: string,
	name: string,
) {
	const api = `${discordAPIBaseURL}/channels/${channelId}/messages/${messageId}/threads`;
	const headers = {
		Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
		'Content-Type': 'application/json',
	};
	const response = await fetch(api, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			name,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to create Thread: ${response.statusText}`);
	}

	return response.json() as unknown as RESTGetAPIChannelResult;
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
