import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../configs/server.config.js';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const CompanySchema = new Schema({
  name: {
    type: String,
    trim: true,
    maxlength: 60,
    required: 'Require name',
  },
  manager: {
    type: Number,
  },
  slug: {
    type: String,
    trim: true,
  },
  overview: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    trim: true,
  },
  cover: {
    type: String,
    trim: true,
  },
  skills: [{
    type: String,
    default: [],
  }],
  mobile: {
    type: String,
    trim: true,
    maxlength: 20,
    required: 'Require mobile',
  },
  email: {
    type: String,
    trim: true,
    required: 'Require email',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  content: {
    type: String,
    trim: true,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  from: {
    type: Number,
  },
  company: {
    type: Number,
  },
  publish: {
    type: Boolean,
    default: false,
  },
  starCount: {
    type: Number,
    default: 0,
  },

});
CompanySchema.plugin(autoIncrement.plugin, {
  model: 'Company',
  startAt: 1,
});
CompanySchema.index({ title: 'text', description: 'text' });
CompanySchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Company', CompanySchema);
