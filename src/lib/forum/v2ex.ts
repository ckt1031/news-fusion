import 'dotenv/config';

import { V2EX } from '@/config/forum-sources';
import embeddingTemplate from '@/prompts/embedding-template';
import { envSchema } from '@/types/env';
import translate from '@iamtraction/google-translate';
import consola from 'consola';
import { getEncoding } from 'js-tiktoken';
import Mustache from 'mustache';
import {
	addSimilarArticleToDatabase,
	checkIfNewsIsNew,
	createArticleDatabase,
} from '../db';
import { requestEmbeddingsAPI } from '../llm/api';
import {
	checkArticleImportance,
	summarizeIntoShortText,
} from '../llm/prompt-calls';
import sendNewsToDiscord from '../news/send-discord-news';
import { isArticleSimilar } from '../news/similarity';
import { parseRSS } from '../parse-news';
import { getContentMakrdownFromURL } from '../tool-apis';

/**
 * Experimental code to check V2EX discussions
 */

process.env.DEFAULT_SUMMARIZE_MODEL = 'gpt-3.5-turbo-0125';
process.env.DEFAULT_CHECK_IMPORTANCE_MODEL = 'gpt-3.5-turbo-0125';

const env = await envSchema.parseAsync(process.env);

const specialCheckPrompt = `# Role

You are designed to browse and find important discussions that are worth reading for global, tech innovations, or developers. Your goal is to help users save time by identifying whether an article is worth reading for extra knowledge and personal improvement.

This is a forum from V2EX, a Chinese tech forum. You are to evaluate the significance of the discussions.

## Instructions

1. Input Format: You will be provided with article content in text or markdown format.
2. Output Format: Respond with a single Boolean text, either "true" or "false", in fully lowercase. Do not provide any additional context or comments.

## Analysis Criteria

### Important Discussions (True)

- Security issue, leaks
  - e.g. 恶意 VSCode 拓展已有数百万次安装
- Tool, Platform or Project updates, creations, sharing or releases
- Experiences, or sharing on how to use technology in real life
- Sharing websites/tools to help personal development or breakthroughs of information gap.
- Open Sourced something is really familar or useful, or even a new project.
- Asking for recommendations, suggestions, or help on a project, tool, or platform, that worth receiving some useful feedback.

### Unimportant Discussions (False)

- Stupid questions, or questions that are not worth asking, or even clickbait like we usually called 标题党
- Cannot access to something (since in mainland China, a lot of websites are blocked)
- No content, less useful content.
- Job opportunities, job search, or job-seeking advice.
- Groups joining or forming
  - e.g. We opened our WeChat group for developers.
- Group purchasing
  - e.g. Buy ChatGPT Plus team 5 people, xx 人车

## Constraints

- Output: Only return "true" or "false" as the response.
- Penalties: You will be penalized if you return anything other than "true" or "false".

## Example

### Input

Apple announces the release of a new AI-powered feature in their latest iOS update, which is expected to revolutionize user interaction with their devices.

### Output

true

### Input

A new restaurant opens in downtown New York City, offering a unique fusion of Japanese and Italian cuisine.

### Output

false
`;

function specialFilter(title: string) {
	if (title.includes('工作')) return false;

	if (title.includes('优惠信息')) return false;

	return true;
}

async function checkV2EXDission(props: {
	link: string;
	title: string;
	guid: string;
	pubDate: string;
}) {
	if (!specialFilter(props.title)) {
		consola.info('Skip', props.title);
		return;
	}

	const isNew = await checkIfNewsIsNew(env, props.guid);

	if (!isNew) {
		consola.info('Skip', props.title);
		return;
	}

	let markdown = await getContentMakrdownFromURL(env, props.link);

	const enc = getEncoding('cl100k_base');
	const tokens = enc.encode(markdown).length;

	if (tokens > 8000) {
		const { text } = await translate(markdown, { to: 'en' });
		markdown = text;
	}

	const embeddingText = Mustache.render(embeddingTemplate, {
		title: props.title,
		link: props.link,
		content: markdown,
	});

	const embedding = await requestEmbeddingsAPI({
		env,
		text: embeddingText,
		timeout: 5 * 1000,
	});

	const similar = await isArticleSimilar(env, embedding, props.link);

	if (similar.result && similar.similarities[0]) {
		consola.success('Similar article found for', props.title);

		await addSimilarArticleToDatabase(
			env,
			props.link,
			similar.similarities[0].url,
		);

		return;
	}

	const important = await checkArticleImportance(env, markdown, {
		customSystemPrompt: specialCheckPrompt,
	});

	consola.box('Result', props.title, important);

	if (important) {
		const shortSummary = await summarizeIntoShortText(env, markdown);

		await sendNewsToDiscord({
			env,
			data: {
				description: shortSummary,
				feed: {
					title: 'V2EX',
				},
				news: {
					title: props.title,
					link: props.link,
					pubDate: props.pubDate,
				},
				channelId: '1246408890229194772',
			},
		});
	}

	await createArticleDatabase(env, {
		important,
		title: props.title,
		url: props.link,
		publisher: props.title,
		category: 'V2EX',
		guid: props.guid,
		publishedAt: new Date(props.pubDate),
		embedding,
	});
}

async function checkV2EX() {
	const allDiscussions = await Promise.all(
		V2EX.map((url) => parseRSS(url)),
	).then((results) => results.flatMap((result) => result.item));

	for (const discussion of allDiscussions) {
		try {
			await checkV2EXDission(discussion);
		} catch (e) {
			consola.error(e);
		}

		// Timeout to prevent rate limit
		await new Promise((resolve) => setTimeout(resolve, 1500));
	}
}

await checkV2EX();
