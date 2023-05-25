export enum ButtonCustomIds {
  BotInfo = 'bot-info',
  AddToNewsStarboard = 'news-starboard-add',
  SummarizeNews = 'summarize_rss_news',
  TranslateNews = 'translate_rss_notification',

  // Private
  ShirkDatabase = 'shirk-database',

  // Server Admin
  ManageServerConfig = 'manage-server-config',
}

export enum ModalCustomIds {
  SummarizeNewsAction = 'modal-summarize_rss_news_action',
  ServerConfigurations = 'modal-server-configuration',
}

export enum ServerConfigurationModelFieldIds {
  RssStarboardChannelId = 'rssStarboardChannelId',
  EnableNewsSummarizing = 'enableNewsSummarizing',
  EnableNewsTranslation = 'enableNewsTranslation',
}

export enum NewsSummarizingModelFieldIds {
  TextLengthMode = 'text_length_mode',
  Language = 'language',
  ArticleUrl = 'article_url',
}
