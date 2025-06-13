import type { HtmlToTextOptions } from 'html-to-text';

export const htmlToTextOptions: HtmlToTextOptions = {
	// Remove images
	selectors: [
		{ selector: 'img', format: 'skip' },
		{ selector: 'figure', format: 'skip' },
		{ selector: 'a', options: { ignoreHref: true } },
	],
};
