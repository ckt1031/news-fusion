/* eslint-disable unicorn/filename-case */
import * as mongoose from 'mongoose';

export interface RssFeedTag {
  _id: string;
  name: string;

  serverId: string;
  sendToChannelId: string;
}

const Schema = new mongoose.Schema<RssFeedTag>(
  {
    name: { type: String, required: true },
    serverId: { type: String, required: true },
    sendToChannelId: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

Schema.index({ name: 1, serverId: 1 }, { unique: true });

export default mongoose.model('rss-feed-tags', Schema);
