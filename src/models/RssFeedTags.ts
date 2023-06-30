/* eslint-disable unicorn/filename-case */
import * as mongoose from 'mongoose';

export interface RssFeedTag {
  _id: string;
  name: string;

  serverId: string;
  sendToChannelId: string;

  // AI Filtering
  aiFilteringRequirement: string;
}

const Schema = new mongoose.Schema<RssFeedTag>(
  {
    name: { type: String, required: true },
    serverId: { type: String, required: true },
    sendToChannelId: { type: String, required: true, default: '' },
    aiFilteringRequirement: { type: String, required: true, default: '' },
  },
  {
    timestamps: true,
  },
);

Schema.index({ name: 1, serverId: 1 }, { unique: true });

export default mongoose.model('rss-feed-tags', Schema);
