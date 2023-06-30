/* eslint-disable unicorn/filename-case */
import * as mongoose from 'mongoose';

import type { RssFeedTag } from './RssFeedTags';

export interface RssFeedSource {
  _id: string;
  name: string;
  serverId: string;
  sourceURL: string;
  tag: RssFeedTag;
  enableMentionRole: boolean;
  mentionRoleId: string;
  aiFilterRequirement: string;
}

const Schema = new mongoose.Schema<RssFeedSource>(
  {
    name: { type: String, required: true },
    serverId: { type: String, required: true },
    sourceURL: { type: String, required: true },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'rss-feed-tags',
      required: true,
    },
    enableMentionRole: { type: Boolean, required: false, default: false },
    mentionRoleId: { type: String, required: false, default: '0' },
  },
  {
    timestamps: true,
  },
);

Schema.index({ sourceURL: 1 }, { unique: true });

export default mongoose.model('rss-feed-sources', Schema);
