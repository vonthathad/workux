import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import sanitizeHtml from 'sanitize-html';
import slug from 'limax';
import crypto from 'crypto';
import { getErrorMessage } from '../util/error';
import serverConfig from '../config';
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
    ref: 'User',
  },
  slug: {
    type: String,
    unique: true,
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
    ref: 'Skill',
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
  starCount: {
    type: Number,
    default: 0,
  },

});
CompanySchema.statics.remove = function remove(input) {
  return new Promise((resolve, reject) => {
    input.remove((err, deleted) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(deleted);
    });
  });
};
CompanySchema.statics.getById = function add(id) {
  return new Promise((resolve, reject) => {
    this.findById(id).exec((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      if (!result) { reject({ code: 400, message: `Failed to load company ${id}` }); return; }
      resolve(result);
    });
  });
};
CompanySchema.statics.getBySlug = function getBySlug(_slug) {
  return new Promise((resolve, reject) => {
    this.findOne({ slug: _slug }).exec((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
CompanySchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const data = input;
    if (data.name) {
      data.name = sanitizeHtml(data.name);
      data.slug = `${slug(data.name)}-${crypto.randomBytes(6).toString('hex')}`.toLowerCase();
    }
    if (data.mobile) data.mobile = sanitizeHtml(data.mobile);
    if (data.email) data.email = sanitizeHtml(data.email);
    const company = new this(data);
    company.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};

CompanySchema.statics.updateById = function updateById(input) {
  const company = input;
  return new Promise((resolve, reject) => {
    if (company.name) {
      company.name = sanitizeHtml(company.name);
      company.slug = `${slug(company.name)}-${crypto.randomBytes(6).toString('hex')}`.toLowerCase();
    }
    if (company.mobile) company.mobile = sanitizeHtml(company.mobile);
    if (company.email) company.email = sanitizeHtml(company.email);
    this.findByIdAndUpdate(company._id, company, (err, updated) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(updated);
    });
  });
};
CompanySchema.statics.list = function list(query) {
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
CompanySchema.statics.findLatestCompany = function findLatestCompany() {
  return new Promise((resolve, reject) => {
    this.findOne({}, {}, { sort: { _id: -1 } }, (err, latest) => {
      if (err) { reject({ code: 500, err }); return; }
      // if (!latestCompany) { reject({ code: 404, err }); return; }
      if (latest == null) resolve({ _id: 1 });
      else resolve(latest);
    });
  });
};
CompanySchema.plugin(autoIncrement.plugin, {
  model: 'Company',
  startAt: 1,
});
CompanySchema.index({ name: 'text' });
CompanySchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('Company', CompanySchema);
