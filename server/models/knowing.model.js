import mongoose from 'mongoose';
import { getErrorMessage } from '../util/error';
const Schema = mongoose.Schema;
const KnowingSchema = new Schema({
  user: {
    type: Number,
    required: 'Require user',
    ref: 'User',
  },
  skill: {
    type: Number,
    required: 'Require skill',
    ref: 'Skill',
  },
  level: {
    type: Number,
    required: 'Require level',
  },
  skills: {
    type: Array,
  },
});
KnowingSchema.statics.remove = function remove(input) {
  return new Promise((resolve, reject) => {
    input.remove((err, deleted) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(deleted);
    });
  });
};
KnowingSchema.statics.getById = function add(id) {
  return new Promise((resolve, reject) => {
    this.findById(id).exec((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      if (!result) { reject({ code: 400, message: `Failed to load knowing ${id}` }); return; }
      resolve(result);
    });
  });
};
KnowingSchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const data = input;
    const knowing = new this(data);
    knowing.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
KnowingSchema.statics.updateById = function updateById(input) {
  const knowing = input;
  return new Promise((resolve, reject) => {
    this.findByIdAndUpdate(knowing._id, knowing, (err, updated) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(updated);
    });
  });
};
KnowingSchema.statics.list = function list(query) {
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
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(results);
    });
  });
};
KnowingSchema.statics.merge = function merge(query) {
  return new Promise((resolve, reject) => {
    const { source, path, match, sort, skip, paging, select } = query;
    this.populate(source, {
      path,
      match,
      select,
      options: {
        sort,
        skip,
        limit: paging,
      },
    }, (err, results) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(results);
    });
  });
};
KnowingSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Knowing', KnowingSchema);
