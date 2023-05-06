/* eslint-disable unicorn/filename-case */
import * as mongoose from 'mongoose';

export interface RssSourceCheck {
  _id: string;
  sourceURL: string;
  feedURL: string;
  lastChecked: number;
}

const ModuleSchema = new mongoose.Schema<RssSourceCheck>(
  {
    sourceURL: { type: String, required: true },
    feedURL: { type: String, required: true },
    lastChecked: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

ModuleSchema.index({ sourceURL: 1, feedURL: 1 }, { unique: true });

export default mongoose.model('rss-feed-checks', ModuleSchema);
