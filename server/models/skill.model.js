import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import slug from 'limax';
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../config';
import { getErrorMessage } from '../util/error';
const Schema = mongoose.Schema;
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const SkillSchema = new Schema({
  slug: {
    type: String,
    trim: true,
    maxlength: 60,
    unique: true,
    description: 'slug of title',
  },
  title: {
    type: String,
    trim: true,
    maxlength: 60,
    required: 'Require title',
  },
  root: {
    type: Schema.Types.String,
    trim: true,
    ref: 'Skill',
  },
  isRoot: {
    type: Boolean,
    default: false,
  },
  buffScore: {
    type: Number,
    default: 0,
  },
});
SkillSchema.statics.remove = function remove(input) {
  return new Promise((resolve, reject) => {
    input.remove((err, deleted) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(deleted);
    });
  });
};
SkillSchema.statics.getById = function getById(id) {
  return new Promise((resolve, reject) => {
    this.findById(id)
      .exec((err, result) => {
        if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
        if (!result) { reject({ code: 400, messages: [`Failed to load skill ${id}`] }); return; }
        resolve(result);
      });
  });
};
SkillSchema.statics.getBySlug = function getBySlug(_slug) {
  return new Promise((resolve, reject) => {
    this.findOne({ slug: _slug }).exec((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
SkillSchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const data = input;
    if (data.title) {
      data.title = sanitizeHtml(data.title);
      data.slug = slug(data.title);
    }
    const skill = new this(input);
    skill.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
SkillSchema.statics.updateById = function updateById(input) {
  const skill = input;
  return new Promise((resolve, reject) => {
    if (skill.title) {
      skill.title = sanitizeHtml(skill.title);
      skill.slug = slug(skill.title);
    }
    this.findByIdAndUpdate(skill._id, skill, (err, updated) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(updated);
    });
  });
};
SkillSchema.statics.list = function list(query) {
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
SkillSchema.index({ title: 'text', slug: 'text' });
SkillSchema.plugin(autoIncrement.plugin, {
  model: 'Skill',
  startAt: 1,
});
SkillSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Skill', SkillSchema);
