import { extract } from '@extractus/article-extractor';
import { convert } from 'html-to-text';

function removeMarkdownLinks(text: string) {
  // eslint-disable-next-line unicorn/better-regex
  return text.replace(/\[.*?\]/g, '');
}

export default async function extractArticle(url: string) {
  const article = await extract(url);

  if (!article) {
    return undefined;
  }

  const content = convert(article.content ?? '');

  const textWithoutLinks = removeMarkdownLinks(content);

  return { ...article, parsedTextContent: textWithoutLinks };
}
