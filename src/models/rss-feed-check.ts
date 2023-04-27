import { model, Schema } from 'mongoose';

const ModuleSchema = new Schema(
  {
    sourceURL: { type: String },
    feedURL: { type: String },
    lastChecked: { type: Number },
  },
  {
    timestamps: true,
  },
);

export default model('rss-feed-checks', ModuleSchema);
