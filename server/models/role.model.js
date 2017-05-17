import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import { getErrorMessage } from '../util/error';
import serverConfig from '../config';
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const RoleSchema = new Schema({
  roleName: {
    type: String,
    required: 'Require role name',
  },
});
RoleSchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const role = new this(input);
    role.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
RoleSchema.statics.list = function list(query) {
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
RoleSchema.plugin(autoIncrement.plugin, {
  model: 'Role',
  startAt: 1,
});
RoleSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Role', RoleSchema);
