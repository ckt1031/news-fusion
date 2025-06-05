import { z } from 'zod';
import { RSS_CATEGORIES } from '../../config/sources.js';

export const NewsProcessorSchema = z.object({
	title: z.string(),
	summary: z.string(),
	important: z.boolean(),
	category: z.enum(RSS_CATEGORIES.map((category) => category.id) as [string]),
});

export const NewsProcessorPrompt = `
# Task: News Processor

You will be given a news article, you will first classify whether the article is important or not.
If the article is not important, mark important as false and empty all other fields.
Otherwise, classify the article into a category from given categories from schema.
Eventually, summarize the article in title and summary fields.

## Importance Classification

Determine if the content is worth reading for news, knowledge and improvement by following the criteria:

- Emergent, related, critical to given categories
- Public health issues
- Critical societal events
- Major company news, acquisitions, or mergers
- Major political news, historical events or wide-impact occurrences
- Major funding, investments or venture capital
- Projects, collaborations or partnerships
- New technology announcements, innovations, or updates
- Major accidents, disasters or calamities
- Critiques of companies, politics, social issues or phenomena
- Leaks or security breaches
- General availability or impactful products or services
- Major software updates like MacOS, iOS, Android, Windows, Linux, etc, also include new features for popular software

However, some articles are not important and not worth reading:

- Quizzes
- Product reviews
- Advice or tips
- Expectations but not actual releases or announcements
- Tutorials like different Ways to do something:
    e.g. Google AI: 5 ways to boost productivity
- How this or that stuffs help people or companies
- Company dividends declared or paid
- Any advertisements, savings, sales, gifts, promotions, or discounts
- Comparisons or "best of" lists
- Racist, Sexual, LGBT or Transgender
- Minor personnel changes
- Minor tutorials, guides or suggestions
- Minor politics, social issues or phenomena

## Category Classification

When categorizing, consider the central action, event, or primary focus that drives the article's significance.
If an article discusses a new technological breakthrough primarily in the context of its impact on healthcare delivery,
the kernel might be "Healthcare" or "Medical Innovation," even though "Technology" is present.
If a company known for renewable energy announces a major policy change regarding carbon emissions,
the kernel might be "Environmental Policy" or "Sustainability," rather than just "Renewable Energy."

Prioritize the category that best represents this core, impactful element.
If multiple categories seem relevant, always choose the one that describes the most direct and significant action or outcome the article is reporting.

## Summary

Respond in English US only.
No escape characters or emojis.
No bullet points, lists, or any other formatting.
No questions, extra comments, links, references, or any other text.

Title: 10 words max, concise, specific, no quotations marks, single line without commas or line breaks
Summary: 150 words max, plain text only, no markdown or HTML, new paragraphs are allowed.
`;
