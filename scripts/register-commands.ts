import { exit } from 'node:process';
import commands from '@/discord/interactions/commands';
import { deleteAllGuildCommands, registerGuildCommands } from '@/discord/utils';

const token = process.env.DISCORD_BOT_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !applicationId || !guildId) {
	throw new Error('Missing environment variables');
}

// Arg1

const mode = process.argv[2];

if (mode === 'delete') {
	await deleteAllGuildCommands(token, applicationId, guildId);
} else {
	for (const command of commands) {
		await registerGuildCommands(token, applicationId, guildId, command.info);
	}
}

exit(0);
