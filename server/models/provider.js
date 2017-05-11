import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../configs/server.config.js';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const ProviderSchema = new Schema({
  providerName: {
    type: String,
    required: 'Require role name',
  },
});
ProviderSchema.plugin(autoIncrement.plugin, {
  model: 'Provider',
  startAt: 1,
});
ProviderSchema.index({ title: 'text', description: 'text' });
ProviderSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Provider', ProviderSchema);
