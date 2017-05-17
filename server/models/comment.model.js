import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import { getErrorMessage } from '../util/error';
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
  createdTime: {
    type: Date,
    default: Date.now,
  },
  post: {
    type: Number,
    required: 'Require post',
    ref: 'Post',
  },
  answer: {
    type: String,
    trim: true,
  },
  question: {
    type: String,
    trim: true,
  },
  position: {
    type: Number,
  },
  from: {
    type: Number,
    ref: 'User',
  },
  userStars: [{
    type: Number,
    default: [],
    ref: 'User',
  }],
});
CommentSchema.statics.remove = function remove(input) {
  return new Promise((resolve, reject) => {
    input.remove((err, deleted) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(deleted);
    });
  });
};
CommentSchema.statics.getById = function getById(id) {
  return new Promise((resolve, reject) => {
    this.findById(id)
      .exec((err, result) => {
        if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
        if (!result) { reject({ code: 400, messages: [`Failed to load skill ${id}`] }); return; }
        resolve(result);
      });
  });
};
CommentSchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const data = input;
    if (data.content) {
      data.content = sanitizeHtml(data.content);
    }
    const skill = new this(input);
    skill.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
CommentSchema.statics.updateById = function updateById(input) {
  const skill = input;
  return new Promise((resolve, reject) => {
    if (skill.content) {
      skill.content = sanitizeHtml(skill.content);
    }
    this.findByIdAndUpdate(skill._id, skill, (err, updated) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(updated);
    });
  });
};
CommentSchema.statics.list = function list(query) {
  return new Promise((resolve, reject) => {
    const { match, project, sort, skip, paging } = query;
    const arr = [];
    if (match) arr.push({ $match: match });
    if (project) arr.push({ $project: project });
    if (sort) arr.push({ $sort: sort });
    if (skip) arr.push({ $skip: skip });
    if (paging) arr.push({ $limit: paging });
    this.aggregate(arr, (err, results) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(results);
    });
  });
};
CommentSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Comment', CommentSchema);
