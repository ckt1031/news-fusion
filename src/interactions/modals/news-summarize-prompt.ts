import { ModalCustomIds, NewsSummarizingModelFieldIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import extractArticle from '@/utils/extract-article';
import logging from '@/utils/logger';
import { getOpenAIResponse } from '@/utils/open-ai';

function processInput(
  input: string,
  options: Record<string, string>,
  defaultValue: string,
): string {
  if (input in options) {
    return options[String(input)];
  } else if (Object.values(options).includes(input)) {
    return input;
  } else {
    return defaultValue;
  }
}

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.SummarizeNewsAction,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const articleURL = interaction.fields.getTextInputValue(
      NewsSummarizingModelFieldIds.ArticleUrl,
    );

    // Available Options for language: 1.English, 2.Chinese
    const language = processInput(
      interaction.fields.getTextInputValue(NewsSummarizingModelFieldIds.Language),
      {
        '1': 'english',
        '2': 'chinese',
      },
      'english',
    );

    const languagePrompt = language === 'english' ? 'English (US)' : 'Chinese Traditional (Taiwan)';

    await interaction.deferUpdate();

    const article = await extractArticle(articleURL);
    const user = interaction.client.users.cache.get(interaction.user.id);

    if (!user || !article.title || !article.source) return;

    logging.info(`NEW SUMMARIZING: Request: ${article.title}`);

    const hostOfArticle = new URL(articleURL).host;
    const prompt = `Task: Summarize this article CONCISELY, but contain most details, RETURN ONLY in **${languagePrompt}** with professional tone, response with the text only. Only summarize about the main idea\nSource: ${hostOfArticle}\nTitle: ${article.title}\n\nContent: ${article.parsedTextContent}`;

    try {
      const chatCompletion = await getOpenAIResponse({
        prompt,
      });

      if (!chatCompletion) {
        await user.send({
          content: `AI Summary: **${article.title}**\nURL: ${articleURL}\n\nNo summary returned.`,
        });
        return;
      }

      await user.send({
        content: `AI Summary: **${article.title}**\nURL: ${articleURL}\n\n${chatCompletion}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        await user.send({
          content: `AI Summary: **${article.title}**\nURL: ${articleURL}\n\nError: \`\`\`${error.message}\`\`\``,
        });
      }
    }

    // Log and record
    logging.info(`NEWS SUMMARIZING: Returned result: ${article.title}`);
  },
};

export default button;
