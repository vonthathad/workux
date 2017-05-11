import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../configs/server.config.js';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const RoleSchema = new Schema({
  roleName: {
    type: String,
    required: 'Require role name',
  },
});
RoleSchema.plugin(autoIncrement.plugin, {
  model: 'Role',
  startAt: 1,
});
RoleSchema.index({ title: 'text', description: 'text' });
RoleSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Role', RoleSchema);
