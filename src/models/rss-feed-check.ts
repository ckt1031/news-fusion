import { model, Schema } from 'mongoose';

const ModuleSchema = new Schema(
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

export default model('rss-feed-checks', ModuleSchema);
