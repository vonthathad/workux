import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import { getErrorMessage } from '../util/error';
import serverConfig from '../config';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const ProviderSchema = new Schema({
  providerName: {
    type: String,
    required: 'Require role name',
  },
});
ProviderSchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const role = new this(input);
    role.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
ProviderSchema.statics.list = function list(query) {
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
ProviderSchema.plugin(autoIncrement.plugin, {
  model: 'Provider',
  startAt: 1,
});
ProviderSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Provider', ProviderSchema);
