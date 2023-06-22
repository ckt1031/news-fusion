export enum ButtonCustomIds {
  BotInfo = 'bot-info',
  AddToNewsStarboard = 'news-starboard-add',
  SummarizeNews = 'summarize_rss_news',
  TranslateNews = 'translate_rss_notification',

  // Private
  ShirkDatabase = 'shirk-database',

  // Server Admin
  ManageServerConfig = 'manage-server-config',

  // RSS Source
  RssSourcePanel = 'rss-source-panel',
  ListRssSource = 'list-rss-source',
  ListRssSourcePanelNextPage = 'list-rss-source-panel-next-page',
  ListRssSourcePanelPreviuousPage = 'list-rss-source-panel-previous-page',
  AddRssSource = 'add-rss-source',
  AddRssSourceTag = 'add-rss-source-tag',
  DeleteRssSource = 'delete-rss-source',
  DeleteRssSourceTag = 'delete-rss-source-tag',
}

export enum MenuCustomIds {
  DisplayRssSourcePanel = 'display_rss_source_panel',
}

export enum ModalCustomIds {
  SummarizeNewsAction = 'summarize_rss_news_action',
  ServerConfigurations = 'server_configuration',
  CreateRssSource = 'create_rss_source',
  CreateRssSourceTag = 'create_rss_source_tag',
  DeleteRssSource = 'delete_rss_source',
  DeleteRssSourceTag = 'delete_rss_source_tag',
}

export enum ServerConfigurationModelFieldIds {
  RssStarboardChannelId = 'rss_starboard_channel_id',
  EnableNewsStarboard = 'enable_starboard',
  EnableNewsSummarizing = 'enable_news_summarizing',
  EnableNewsTranslation = 'enable_news_translation',
}

export enum NewsSummarizingModelFieldIds {
  Language = 'language',
  ArticleUrl = 'article_url',
}

export enum CreateRssSourceModelFieldIds {
  Name = 'name',
  SourceUrl = 'source_url',
  TagName = 'tag_name',
  MentionRoleId = 'mention_role_id',
  EnableRoleMention = 'enable_role_mention',
}

export enum CreateRssSourceTagModelFieldIds {
  Name = 'name',
  SendToChannelId = 'send_to_channel_id',
}

export enum DeleteRssSourceModelFieldIds {
  Name = 'name',
  TagName = 'tag_name',
}

export enum DeleteRssSourceTagModelFieldIds {
  Name = 'name',
  DeleteAllSources = 'delete_all_sources',
}
