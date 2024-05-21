import { discordMessage } from '@/discord/utils';
import { DISCORD_INTERACTION_BUTTONS } from '@/types/discord';
import type { ServerEnv } from '@/types/env';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';

type SendNewsToDiscordProps = {
	env: ServerEnv;
	newsData: {
		title: string;
		link: string;
		pubDate: string;
	};
};

export default async function sendNewsToDiscord({
	env,
	newsData,
}: SendNewsToDiscordProps) {
	await discordMessage.send({
		token: env.DISCORD_BOT_TOKEN,
		channelId: env.DISCORD_RSS_CHANNEL_ID,
		body: {
			embeds: [
				{
					title: newsData.title,
					url: newsData.link,
					author: {
						name: newsData.title,
					},
					timestamp: new Date(newsData.pubDate).toISOString(),
				},
			],
			components: [
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
			],
		},
	});
}
