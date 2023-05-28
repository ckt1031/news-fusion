export interface FeedItem {
  title: string;
  url: string;
  pubDate: string;

  // everything else is optional
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface RssFeed {
  source: {
    title: string;
    url: string;
    enableRoleMention: boolean;
  };
  tag: {
    name: string;
    serverId: string;
    sendToChannelId: string;
    mentionRoleId?: string;
  };
  article: Partial<FeedItem>;
}
