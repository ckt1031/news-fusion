import { discordMessage } from '@/discord/utils';
import { DiscordBotInteractionButtons } from '@/types/discord';
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
		includeAIButtons?: boolean;
		thumbnail?: string;
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
					custom_id: DiscordBotInteractionButtons.Summarize,
				},
				{
					type: ComponentType.Button,
					style: ButtonStyle.Secondary,
					label: 'Translate',
					custom_id: DiscordBotInteractionButtons.Translate,
				},
				{
					type: ComponentType.Button,
					style: ButtonStyle.Secondary,
					emoji: {
						name: '🔁',
					},
					custom_id: DiscordBotInteractionButtons.ReGenerateNewsNotification,
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
					...(data.thumbnail
						? {
								thumbnail: {
									url: data.thumbnail,
								},
							}
						: {}),
				},
			],
			components: data.includeAIButtons ? components : [],
		},
	});
}
