import { extract } from '@extractus/article-extractor';
import { convert } from 'html-to-text';

function removeMarkdownLinks(text: string) {
  // eslint-disable-next-line unicorn/better-regex
  return text.replaceAll(/\[.*?\]/g, '');
}

// Extracts content from a URL
export default async function extractArticle(url: string) {
  // Extract article
  const article = await extract(url);

  // Throw error if no article
  if (!article) throw new Error('Failed to extract article');

  // Convert HTML to text
  const content = convert(article.content ?? '');

  // Remove markdown links
  const parsedTextContent = removeMarkdownLinks(content);

  // Return article
  return { ...article, parsedTextContent };
}
