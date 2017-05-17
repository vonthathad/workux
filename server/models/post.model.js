import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../config.js';
import crypto from 'crypto';
import { getErrorMessage } from '../util/error';
import { getDescription } from '../util/htmlQuery';
import slug from 'limax';
import sanitizeHtml from 'sanitize-html';
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
    ref: 'User',
  },
  company: {
    type: Number,
    ref: 'Company',
  },
  publish: {
    type: Boolean,
    default: false,
  },
  skills: [{
    type: Number,
    default: [],
    ref: 'Skill',
  }],
  slug: {
    type: String,
    maxlength: 100,
    unique: true,
    required: 'Require slug',
  },
  thumb: {
    type: String,
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
    ref: 'User',
  }],
  userStars: [{
    type: Number,
    default: [],
    ref: 'User',
  }],
  viewCount: {
    type: Number,
    default: 0,
  },
});
PostSchema.statics.remove = function remove(input) {
  return new Promise((resolve, reject) => {
    input.remove((err, deleted) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(deleted);
    });
  });
};
PostSchema.statics.getById = function add(id) {
  return new Promise((resolve, reject) => {
    this.findById(id).exec((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      if (!result) { reject({ code: 400, message: `Failed to load post ${id}` }); return; }
      resolve(result);
    });
  });
};
PostSchema.statics.getBySlug = function getBySlug(_slug) {
  return new Promise((resolve, reject) => {
    this.findOne({ slug: _slug }).exec((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
PostSchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const data = input;
    if (data.title) {
      data.title = sanitizeHtml(data.title);
      data.slug = `${slug(data.title)}-${crypto.randomBytes(6).toString('hex')}`.toLowerCase();
    }
    if (data.content) {
      data.description = `${getDescription(data.content).slice(0, 157)}...`;
    }
    const post = new this(data);
    post.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
PostSchema.statics.updateById = function updateById(input) {
  const post = input;
  return new Promise((resolve, reject) => {
    if (post.title) {
      post.title = sanitizeHtml(post.title);
      post.slug = `${slug(post.title)}-${crypto.randomBytes(6).toString('hex')}`.toLowerCase();
    }
    if (post.content) {
      post.description = `${getDescription(post.content).slice(0, 157)}...`;
    }
    this.findByIdAndUpdate(post._id, post, (err, updated) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(updated);
    });
  });
};
PostSchema.statics.list = function list(query) {
  return new Promise((resolve, reject) => {
    const { match, project, sort, skip, paging, group } = query;
    const arr = [];
    if (match) arr.push({ $match: match });
    if (project) arr.push({ $project: project });
    if (sort) arr.push({ $sort: sort });
    if (skip) arr.push({ $skip: skip });
    if (paging) arr.push({ $limit: paging });
    if (group)arr.push({ $group: group });
    this.aggregate(arr, (err, results) => {
      console.log(err);
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(results);
    });
  });
};
PostSchema.statics.merge = function merge(query) {
  return new Promise((resolve, reject) => {
    const { source, path, match, sort, skip, paging, select } = query;
    const _query = {};
    if (path)_query.path = path;
    if (match)_query.match = match;
    if (select)_query.select = select;
    if (sort)_query.options = sort;
    if (skip)_query.options = skip;
    if (paging)_query.limit = paging;
    console.log(_query);
    this.populate(source, _query, (err, results) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(results);
    });
  });
};
PostSchema.statics.findLatestPost = function findLatestPost() {
  return new Promise((resolve, reject) => {
    this.findOne({}, {}, { sort: { _id: -1 } }, (err, latest) => {
      if (err) { reject({ code: 500, err }); return; }
      // if (!latestPost) { reject({ code: 404, err }); return; }
      if (latest == null) resolve({ _id: 1 });
      else resolve(latest);
    });
  });
};

PostSchema.plugin(autoIncrement.plugin, {
  model: 'Post',
  startAt: 1,
});
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Post', PostSchema);
