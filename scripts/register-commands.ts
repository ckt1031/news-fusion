import { exit } from 'node:process';
import commands from '@/discord/interactions/commands';
import { registerGuildCommands } from '@/discord/utils';

const token = process.env.DISCORD_BOT_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !applicationId || !guildId) {
	throw new Error('Missing environment variables');
}

for (const command of commands) {
	await registerGuildCommands(token, applicationId, guildId, command.info);
}

exit(0);
