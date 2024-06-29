import type { RSSCatacory } from '@/config/news-sources';
import type { ServerEnv } from '@/types/env';
import Mustache from 'mustache';
import logging from '../console';
import checkRSS from '../news/check-rss';
import { checkPrompt } from './prompt';

type checkForumProps = {
	env: ServerEnv;
	source: RSSCatacory;
	specialFilter?: (title: string) => boolean;
	criteriaPrompt: {
		importantCriteria: string;
		unimportantCriteria: string;
	};
};

export async function checkForum(props: checkForumProps) {
	const specialCheckPrompt = Mustache.render(checkPrompt, {
		forum: props.source.name,
		importantCriteria: props.criteriaPrompt.importantCriteria,
		unimportantCriteria: props.criteriaPrompt.unimportantCriteria,
	});

	try {
		await checkRSS({
			catagory: props.source,
			env: props.env,
			// specialFilter: props.specialFilter,
			customCheckImportancePrompt: specialCheckPrompt,
		});
	} catch (e) {
		logging.error(e);
	}
}
