import { exit } from 'node:process';
import { HACKER_NEWS, LOBSTE_RS } from '@/config/forum-sources';
import { envSchema } from '@/types/env';
import { checkForum } from '@/lib/forum';
import { getLangfuse } from '@/lib/llm/api';

process.env.DEFAULT_SUMMARIZE_MODEL = 'gpt-3.5-turbo-0125';
process.env.DEFAULT_CHECK_IMPORTANCE_MODEL = 'command-r-plus';

const env = await envSchema.parseAsync(process.env);

// Get Arg[1], if it is 'lobsters', check Lobsters

const accessLobsters = process.argv[2] === 'lobsters';

await checkForum({
	env,
	urls: accessLobsters ? LOBSTE_RS : HACKER_NEWS,
	sourceName: accessLobsters ? 'Lobsters' : 'Hacker News',
	channelID: accessLobsters ? '1250079186475814932' : '1246408976506028064',
	criteriaPrompt: {
		importantCriteria: `- Topics: General topics include but not limited to: tech, science, programming, or business (Apply to all below criteria)
- Significant tech innovations, or breakthroughs
- Personal review or thoughts about stuffs
  - e.g. Why I'm over React
- PC, DEV or TECH knowledge
- Projects
  - Sharing, open source, or new projects
  - Helping for productivity, dev improvement, or simplifying lives
- Good or Serious/Worth reading news
- Facts, Telling the truth, real situation, or important news
- Critics or reviews (No joke or unprofessional content)
- Suggesting some amazing websites like challenging, or useful tools
  - e.g. Find the hidden word before time runs out. Can you survive all 23 words? Play now!
- Mistakes, or errors that worth sharing
- Popular products, platforms, or tools:
  - Specific (detailed) tech on 
  - New version, important or useful updates
- Useful skills
- Sideprojects/Habits that worth sharing, or worth reading
- Their successfull stories, experiences or their failure stories
`,
		unimportantCriteria: `- Any unwanted, unuseful or unworthy content
- Negative, harmful or blaming content
- Stupid questions, or questions that are not worth asking
- Fundings
  - e.g. We raised $1M for our new project
- Job opportunities, job search, or job-seeking advice
- My favourite, or my best, or my worst [Music, Movie, etc.] (Leave book reviews as they are useful)`,
	},
});

await getLangfuse(env).shutdownAsync();

exit(0);
