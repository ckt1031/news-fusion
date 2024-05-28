import { discordMessage } from '@/discord/utils';
import { DISCORD_INTERACTION_BUTTONS } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import {
	type APIActionRowComponent,
	type APIMessageActionRowComponent,
	ButtonStyle,
	ComponentType,
} from 'discord-api-types/v10';

type SendNewsToDiscordProps = {
	env: ServerEnv;
	data: {
		feed: {
			title: string;
		};
		news: {
			title: string;
			link: string;
			pubDate: string;
		};
		channelId: string;
		description?: string;
		disableAllComponents?: boolean;
	};
};

export default async function sendNewsToDiscord({
	env,
	data,
}: SendNewsToDiscordProps) {
	const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [
		{
			type: ComponentType.ActionRow,
			components: [
				{
					type: ComponentType.Button,
					style: ButtonStyle.Secondary,
					label: 'Summarize',
					custom_id: DISCORD_INTERACTION_BUTTONS.GENERATE_SUMMARIZE,
				},
				{
					type: ComponentType.Button,
					style: ButtonStyle.Secondary,
					label: 'Translate',
					custom_id: DISCORD_INTERACTION_BUTTONS.TRANSLATE,
				},
			],
		},
	];
	await discordMessage.send({
		token: env.DISCORD_BOT_TOKEN,
		channelId: data.channelId,
		body: {
			embeds: [
				{
					title: data.news.title,
					url: data.news.link,
					description: data.description,
					author: {
						name: data.feed.title,
					},
					timestamp: new Date(data.news.pubDate).toISOString(),
				},
			],
			components: data.disableAllComponents ? [] : components,
		},
	});
}
