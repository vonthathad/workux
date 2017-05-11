import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../configs/server.config.js';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const KnowingSchema = new Schema({
  user: {
    type: Number,
    required: 'Require user',
  },
  skill: {
    type: String,
    trim: true,
    required: 'Require skill',
  },
  level: {
    type: Number,
    required: 'Require level',
  },
});
KnowingSchema.plugin(autoIncrement.plugin, {
  model: 'Knowing',
  startAt: 1,
});
KnowingSchema.index({ title: 'text', description: 'text' });
KnowingSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Knowing', KnowingSchema);
