import { model, Schema } from 'mongoose';

const ModuleSchema = new Schema({
  sourceURL: { type: String },
  lastChecked: { type: Number },
});

export default model('rss-source-checks', ModuleSchema);
