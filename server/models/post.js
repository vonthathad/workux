import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../configs/server.config.js';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const PostSchema = new Schema({
  content: {
    type: String,
    trim: true,
    required: 'Require content',
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 160,
    required: 'Require description',
  },
  from: {
    type: Number,
    required: 'Require from',
  },
  company: {
    type: Number,
  },
  publish: {
    type: Boolean,
    default: false,
  },
  skills: [{
    type: String,
    default: [],
  }],
  slug: {
    type: String,
    trim: true,
    maxlength: 100,
    required: 'Require slug',
  },
  thumb: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 60,
    required: 'Require title',
  },
  updatedTime: {
    type: Date,
    default: Date.now,
  },
  userShares: [{
    type: Number,
    default: [],
  }],
  userStars: [{
    type: Number,
    default: [],
  }],
  viewCount: {
    type: Number,
    default: 0,
  },
});
PostSchema.plugin(autoIncrement.plugin, {
  model: 'Post',
  startAt: 1,
});
PostSchema.index({ title: 'text', description: 'text' });
PostSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Post', PostSchema);
