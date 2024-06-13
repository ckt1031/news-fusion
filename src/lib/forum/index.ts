import embeddingTemplate from '@/prompts/embedding-template';
import type { ServerEnv } from '@/types/env';
import consola from 'consola';
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
import { getContentMarkdownFromURL } from '../tool-apis';
import { checkPrompt } from './prompt';
import { RSS_CATEGORY } from '@/config/news-sources';

async function checkForumItem(props: {
	env: ServerEnv;
	link: string;
	title: string;
	guid: string;
	pubDate: string;
	sourceName: string;
	channelID: string;
	specialFilter?: (title: string) => boolean;
	criteriaPrompt: checkForumProps['criteriaPrompt'];
}) {
	if (props.specialFilter && !props.specialFilter(props.title)) {
		consola.info('Skip', props.title);
		return;
	}

	const isNew = await checkIfNewsIsNew(props.guid, props.link);

	if (!isNew) {
		consola.info('Skip', props.title);
		return;
	}

	const markdown = await getContentMarkdownFromURL(props.env, props.link);

	// const enc = getEncoding('cl100k_base');
	// const tokens = enc.encode(markdown).length;

	// if (tokens > 8000 && isMostlyChinese(markdown)) {
	// 	const { text } = await translate(markdown, { to: 'en' });
	// 	markdown = text;
	// }

	const embeddingText = Mustache.render(embeddingTemplate, {
		title: props.title,
		link: props.link,
		content: markdown,
		pubdDate: props.pubDate,
	});

	const embedding = await requestEmbeddingsAPI({
		env: props.env,
		text: embeddingText,
		timeout: 5 * 1000,
	});

	const similar = await isArticleSimilar(embedding, props.link);

	if (similar.result && similar.similarities[0]) {
		consola.success(
			'Similar article found for',
			props.title,
			'->',
			similar.similarities[0].url,
		);

		await addSimilarArticleToDatabase(similar.similarities[0].url, props.link);

		return;
	}

	const specialCheckPrompt = Mustache.render(checkPrompt, {
		forum: props.sourceName,
		importantCriteria: props.criteriaPrompt.importantCriteria,
		unimportantCriteria: props.criteriaPrompt.unimportantCriteria,
	});

	const important = await checkArticleImportance(props.env, markdown, {
		customSystemPrompt: specialCheckPrompt,
	});

	consola.box('Result', props.title, important);

	if (important) {
		const shortSummary = await summarizeIntoShortText(props.env, markdown);

		await sendNewsToDiscord({
			env: props.env,
			data: {
				description: shortSummary,
				feed: {
					title: props.sourceName,
				},
				news: {
					title: props.title,
					link: props.link,
					pubDate: props.pubDate,
				},
				channelId: props.channelID,
				includeAIButtons: true,
			},
		});
	}

	await createArticleDatabase({
		important,
		title: props.title,
		url: props.link,
		publisher: props.sourceName,
		category: RSS_CATEGORY.FORUM,
		guid: props.guid,
		publishedAt: new Date(props.pubDate),
		embedding,
	});
}

type checkForumProps = {
	env: ServerEnv;
	urls: string[];
	sourceName: string;
	specialFilter?: (title: string) => boolean;
	channelID: string;
	criteriaPrompt: {
		importantCriteria: string;
		unimportantCriteria: string;
	};
};

export async function checkForum(props: checkForumProps) {
	const allDiscussions = await Promise.all(
		props.urls.map((url) => parseRSS(url)),
	).then((results) => results.flatMap((result) => result.item));

	for (const discussion of allDiscussions) {
		try {
			await checkForumItem({
				...discussion,
				env: props.env,
				channelID: props.channelID,
				sourceName: props.sourceName,
				specialFilter: props.specialFilter,
				criteriaPrompt: props.criteriaPrompt,
			});
		} catch (e) {
			consola.error(e);
		}

		// Timeout to prevent rate limit
		await new Promise((resolve) => setTimeout(resolve, 1500));
	}
}
