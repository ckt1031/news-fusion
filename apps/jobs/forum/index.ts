import type { RSSCatacory } from '@ckt1031/config';
import { checkRSS } from '@ckt1031/news';
import type { ServerEnv } from '@ckt1031/types';
import { logging } from '@ckt1031/utils';
import Mustache from 'mustache';
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
			category: props.source,
			env: props.env,
			// specialFilter: props.specialFilter,
			customCheckImportancePrompt: specialCheckPrompt,
		});
	} catch (e) {
		logging.error(e);
	}
}
