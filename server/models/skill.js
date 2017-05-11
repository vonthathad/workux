import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../configs/server.config.js';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const SkillSchema = new Schema({
  title: {
    type: String,
    trim: true,
    maxlength: 60,
    required: 'Require title',
  },
  root: {
    type: String,
    trim: true,
  },
  isRoot: {
    type: Boolean,
  },
});
SkillSchema.plugin(autoIncrement.plugin, {
  model: 'Skill',
  startAt: 1,
});
SkillSchema.index({ title: 'text', description: 'text' });
SkillSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Skill', SkillSchema);
