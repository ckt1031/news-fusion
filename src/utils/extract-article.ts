import { extract } from '@extractus/article-extractor';
import { convert } from 'html-to-text';

function removeMarkdownLinks(text: string) {
  // eslint-disable-next-line unicorn/better-regex
  return text.replaceAll(/\[.*?\]/g, '');
}

export default async function extractArticle(url: string) {
  const article = await extract(url);

  let parsedTextContent = '';

  // If no content, return the article as is
  if (article?.content) {
    // Convert HTML to text
    const content = convert(article.content);

    // Remove markdown links
    parsedTextContent = removeMarkdownLinks(content);
  }

  return { ...article, parsedTextContent };
}
