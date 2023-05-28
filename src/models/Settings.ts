/* eslint-disable unicorn/filename-case */
import * as mongoose from 'mongoose';

export interface RssFeedTag {
  _id: string;
  serverId: string;
  enableNewsSummarizing: boolean;
  enableNewsTranslation: boolean;
  rssStarboardChannelId: string;
  enableNewsStarboard: boolean;
}

const Schema = new mongoose.Schema<RssFeedTag>(
  {
    serverId: { type: String, required: true },
    rssStarboardChannelId: { type: String, required: true, default: '0' },
    enableNewsStarboard: { type: Boolean, required: true, default: false },
    enableNewsSummarizing: { type: Boolean, required: true, default: false },
    enableNewsTranslation: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

Schema.index({ serverId: 1 }, { unique: true });

export default mongoose.model('settings', Schema);
