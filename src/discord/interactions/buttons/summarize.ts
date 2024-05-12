import {
	type APIMessageComponentInteraction,
	ComponentType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { summarizeText } from '../../../lib/llm';
import type { ServerEnv } from '../../../types/env';
import { createDiscordThread, sendDiscordMessage } from '../../utils';

const summarizeButtonExecution = async (
	env: ServerEnv,
	interactions: APIMessageComponentInteraction,
) => {
	await fetch(
		`https://discord.com/api/v10/interactions/${interactions.id}/${interactions.token}/callback`,
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

	if (!interactions.data) {
		throw new Error('No data provided');
	}

	if (interactions.data.component_type !== ComponentType.Button) {
		throw new Error('Invalid component type');
	}

	const parentMessage = interactions.message;

	if (parentMessage.embeds.length === 0 || !parentMessage.embeds[0].url) {
		throw new Error('No embeds found');
	}

	const url = parentMessage.embeds[0].url;

	const extractAPIResponse = await fetch(
		`${env.TOOLS_API_BASE_URL}/web/extract/markdown?url=${url}`,
		{
			headers: {
				accept: 'application/json',
				Authorization: `Bearer ${env.TOOLS_API_KEY}`,
			},
		},
	);

	if (!extractAPIResponse.ok) {
		throw new Error('Failed to extract content');
	}

	const { content } = (await extractAPIResponse.json()) as { content: string };

	const text = await summarizeText(env, content);

	if (!text) {
		throw new Error('Failed to summarize content');
	}

	const channel = await createDiscordThread(
		env,
		env.DISCORD_RSS_CHANNEL_ID,
		parentMessage.id,
		'Summary',
	);

	await sendDiscordMessage(env, channel.id, {
		content: text,
	});

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: 'hey',
		},
	};
};

export default summarizeButtonExecution;
