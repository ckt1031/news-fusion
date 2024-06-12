import { exit } from 'node:process';
import { V2EX } from '@/config/forum-sources';
import { envSchema } from '@/types/env';
import { checkForum } from '../src/lib/forum';
import { getLangfuse } from '@/lib/llm/api';

process.env.DEFAULT_SUMMARIZE_MODEL = 'yi-medium';
process.env.DEFAULT_CHECK_IMPORTANCE_MODEL = 'yi-large';

const env = await envSchema.parseAsync(process.env);

function specialFilter(title: string) {
	if (title.includes('工作')) return false;

	if (title.includes('优惠信息')) return false;

	return true;
}

await checkForum({
	env,
	urls: V2EX,
	sourceName: 'V2EX',
	specialFilter,
	channelID: '1246408890229194772',
	criteriaPrompt: {
		importantCriteria: `- Truely useful
- Security issue, leaks
  - e.g. 恶意 VSCode 拓展已有数百万次安装
- Tool, Platform or Project updates, creations, sharing or releases
- Experiences, or sharing on how to use technology in real life
- Sharing websites/tools to help personal development or breakthroughs of information gap.
- Open Sourced something is really familar or useful, or even a new project.
- Asking for recommendations, suggestions, or help on a project, tool, or platform, that worth receiving some useful feedback.`,
		unimportantCriteria: `- Negative, harmful or blaming content
- Stupid questions, or questions that are not worth asking, or even clickbait like we usually called 标题党
- Cannot access to something (since in mainland China, a lot of websites are blocked)
- No content, less useful content.
- Job opportunities, job search, or job-seeking advice.
- Groups joining or forming
  - e.g. We opened our WeChat group for developers.
- Group purchasing
  - e.g. Buy ChatGPT Plus team 5 people, xx 人车`,
	},
});

await getLangfuse(env).shutdownAsync();

exit(0);
