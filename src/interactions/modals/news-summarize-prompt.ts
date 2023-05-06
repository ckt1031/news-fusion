import { getResponse } from '../../ai/edge-gpt';
import type { InteractionHandlers } from '../../sturctures/interactions';
import extractArticle from '../../utils/extract-article';
import logging from '../../utils/logger';

const button: InteractionHandlers = {
  type: 'modal',
  customId: 'summarize_rss_news_action',
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    await interaction.deferUpdate();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const textMode = interaction.fields.getTextInputValue('text_mode').toLowerCase() ?? 'balanced';
    let textLengthMode =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      interaction.fields.getTextInputValue('text_length_mode').toLowerCase() ?? 'normal';

    const url = interaction.fields.getTextInputValue('article_url');

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    let language = interaction.fields.getTextInputValue('language').toLowerCase() ?? 'english';

    switch (textLengthMode) {
      case 'short': {
        textLengthMode = 'in short';
        break;
      }
      case 'normal': {
        textLengthMode = 'in normal length';
        break;
      }
      case 'detailed': {
        textLengthMode = 'in possibly detailed';
        break;
      }
      // No default
    }

    language =
      language === 'english'
        ? 'English (US)'
        : 'Chinese Traditional (Taiwan ZH_TW) (NO SIMPLIFIED)';

    if (!url) return;

    const article = await extractArticle(url);
    const user = interaction.client.users.cache.get(interaction.user.id);

    if (!user || !article.title || !article.source) return;

    const content =
      article.parsedTextContent.length > 1700
        ? article.parsedTextContent.slice(0, 1600) + '...'
        : article.parsedTextContent;

    logging.info(`NEW TRANSLATION: Request: ${article.title}`);

    const order = `(Please summarize this news in ${language} with professional tone, the text should be ${textLengthMode} with maxmium 1600 word length, don't include any hyperlinks, change personal subject to the exact object)`;

    const reply = await getResponse(
      textMode === 'balanced' ? 'balanced' : 'concise',
      `${order} Source: ${article.source}\nTitle: ${article.title}\n${content}`,
    );

    await user.send({
      content: `AI Summary: **${article.title}**\nURL: ${url}\n\n${reply}`,
    });

    // Log and record
    logging.info(`NEWS SUMMARIZING: Returned result: ${article.title}`);
  },
};

export default button;
