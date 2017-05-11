import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../configs/server.config.js';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const KnowingSchema = new Schema({
  text: {
    type: String,
    maxlength: 160,
    trim: true,
    required: 'Require text',
  },
  skills: [{
    type: String,
    default: [],
  }],
});
KnowingSchema.plugin(autoIncrement.plugin, {
  model: 'Knowing',
  startAt: 1,
});
KnowingSchema.index({ title: 'text', description: 'text' });
KnowingSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Knowing', KnowingSchema);
