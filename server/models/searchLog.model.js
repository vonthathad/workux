import mongoose from 'mongoose';
import { getErrorMessage } from '../util/error';
const Schema = mongoose.Schema;
const SearchLogSchema = new Schema({
  text: {
    type: String,
    maxlength: 160,
    trim: true,
    required: 'Require text',
  },
  skills: [{
    type: Number,
    default: [],
    ref: 'Skill',
  }],
  createdTime: {
    type: Date,
    default: Date.now,
  },
});
SearchLogSchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const data = input;
    const searchLog = new this(data);
    searchLog.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
SearchLogSchema.statics.list = function list(query) {
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
SearchLogSchema.index({ text: 'text' });
SearchLogSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('SearchLog', SearchLogSchema);
