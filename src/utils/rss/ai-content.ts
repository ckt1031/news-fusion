import extractArticle from '../extract-article';
import { getOpenaiResponse } from '../open-ai';

interface AiContent {
  isClickBait: boolean;
  scores: {
    scale: number; // Weight: 2.5
    magnitude: number; // Weight: 3
    potential: number; // Weight: 2
    novelty: number; // Weight: 1.5
    credibility: number; // Weight: 2
  };
  summary: string;
}

export default async function getAiContent(url: string) {
  const article = await extractArticle(url);

  if (!article.title || !article.published) {
    return undefined;
  }

  const sourceHost = new URL(url).hostname;

  const task = `Tasks: Analyze this article, provide a score with the following significance score, and summarize the content with a short text, details, and a professional tone, beware to remove unnecessary information, ignoring the standards below in the summary text, only care about the article content.
  Response Requirement: ONLY JSON, {
    isClickBait: boolean;
    scores: {
      scale: number;
      magnitude: number;
      potential: number;
      novelty: number;
      credibility: number;
    };
    summary: string;
  } no extra fields
  Standards: (Score from 0 to 10 for each)
  scale: how many people the event affected, more groups of people affected, scores higher
  magnitude: how big the effect, the larger severity to humanity and society, scores higher.
  potential: how likely it is that the event will cause bigger events to the entire humanity and society;
  novelty: how unexpected or unique was the event;
  credibility: how credible is the source.
  isClickBait: whether the title is clickbait or not. (Boolean)
  Give the reason why you give such a score to each item.
  Only give the score and explanations as the response.
`;

  const prompt = `
  ${task}
  ---
  Title: ${article.title}
  Source: ${sourceHost}
  Date: ${article.published}
  Content: ${article.parsedTextContent}
  `;

  const response = await getOpenaiResponse({ prompt });

  // Check if response is valid and json
  if (!response || typeof response !== 'string') {
    return undefined;
  }

  // Parse response
  const parsedResponse: AiContent = JSON.parse(response);

  const weightedMean = Number(
    (
      (parsedResponse.scores.scale * 2.5 +
        parsedResponse.scores.magnitude * 3 +
        parsedResponse.scores.potential * 2 +
        parsedResponse.scores.novelty * 1.5 +
        parsedResponse.scores.credibility * 2) /
      11
    ).toFixed(2),
  );

  const summary = parsedResponse.summary;

  return { weightedMean, summary };
}
