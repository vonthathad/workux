import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../config';
import { getErrorMessage } from '../util/error';
import crypto from 'crypto';
import slug from 'limax';
import sanitizeHtml from 'sanitize-html';
import Jwt from 'jsonwebtoken';
const Schema = mongoose.Schema;
const privateKey = serverConfig.key.privateKey;
const connection = mongoose.createConnection(serverConfig.mongoURL);
autoIncrement.initialize(connection);
const UserSchema = new Schema({
  url: {
    type: String,
    trim: true,
    description: 'short url of user',
    unique: true,
  },
  username: {
    type: String,
    trim: true,
    description: 'email login of user',
    required: 'Require username',
    unique: true,
  },
  displayName: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
    minlength: 5,
  },
  salt: {
    type: String,
  },
  token: {
    type: String,
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
    trim: true,
  },
  company: {
    type: Number,
    ref: 'Company',
  },
  suspend: {
    type: Boolean,
    default: false,
  },
  violation: {
    type: Number,
    default: 0,
  },
  aph: {
    type: Number,
    description: 'action per hour',
    default: 0,
  },
  role: {
    type: Number,
    ref: 'Role',
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  lastTime: {
    type: Date,
  },
  provider: {
    type: Number,
    required: 'Require provider',
    ref: 'Provider',
  },
  providerId: {
    type: Number,
  },
  providerData: {},
  // max 5 -> moi unshift sau do push
  searchSkills: [{
    type: String,
    ref: 'Skill',
  }],
  // follow 1 trong 3 se hien ra feed
  followUsers: [{
    type: String,
    ref: 'User',
    default: [],
  }],
  followCompanies: [{
    type: String,
    ref: 'Company',
    default: [],
  }],
  followSkills: [{
    type: String,
    ref: 'Skill',
    default: [],
  }],
  editorScore: {
    type: Number,
    default: 0,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  starCount: {
    type: Number,
    default: 0,
  },

});
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000,
    64, 'sha1').toString('base64');
}
function preSave(next) {
  if (this.password) {
    this.salt = new
      Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = hashPassword(this.password, this.salt);
  }
  next();
}
function preUpdate(next) {
  if (this.getUpdate().password) {
    this.getUpdate().salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.getUpdate().password = hashPassword(this.getUpdate().password, this.getUpdate().salt.toString());
  }
  next();
}
UserSchema.statics.authenticate = function authenticate(password, salt) {
  return this.password === hashPassword(password, salt);
};

UserSchema.statics.remove = function remove(input) {
  return new Promise((resolve, reject) => {
    input.remove((err, deleted) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(deleted);
    });
  });
};
UserSchema.statics.getById = function getById(id) {
  return new Promise((resolve, reject) => {
    this.findById(id).exec((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      if (!result) { reject({ code: 400, message: `Failed to load user ${id}` }); return; }
      resolve(result);
    });
  });
};
UserSchema.statics.getBySlug = function getBySlug(_slug) {
  return new Promise((resolve, reject) => {
    this.findOne({ url: _slug }).exec((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};
UserSchema.statics.add = function add(input) {
  return new Promise((resolve, reject) => {
    const data = input;
    data.provider = 0;
    if (data.displayName) {
      data.displayName = sanitizeHtml(data.displayName);
      data.url = `${slug(data.displayName)}-${crypto.randomBytes(6).toString('hex')}`.toLowerCase();
    }
    if (data.bio) data.bio = sanitizeHtml(data.bio);
    const tokenDt = {
      username: data.username,
    };
    const user = new this(input);
    user.token = Jwt.sign(tokenDt, privateKey);
    user.save((err, result) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      resolve(result);
    });
  });
};

UserSchema.statics.updateById = function updateById(input) {
  return new Promise((resolve, reject) => {
    const data = input;
    data.provider = 0;
    if (data.displayName) {
      data.displayName = sanitizeHtml(data.displayName);
      data.url = `${slug(data.displayName)}-${crypto.randomBytes(6).toString('hex')}`.toLowerCase();
    }
    if (data.bio) data.bio = sanitizeHtml(data.bio);
    const tokenDt = {
      username: data.username,
    };
    data.token = Jwt.sign(tokenDt, privateKey);
    this.findOneAndUpdate({ _id: data._id }, data, (err, updated) => {
      if (err) { reject({ code: 500, message: getErrorMessage(err) }); return; }
      if (!updated) { reject({ code: 400, message: 'User not exit' }); return; }
      resolve(updated);
    });
  });
};
UserSchema.statics.list = function list(query) {
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

UserSchema.statics.findLatestUser = function findLatestUser() {
  return new Promise((resolve, reject) => {
    this.findOne({}, {}, { sort: { _id: -1 } }, (err, latest) => {
      if (err) { reject({ code: 500, err }); return; }
      // if (!latestUser) { reject({ code: 404, err }); return; }
      if (latest == null) resolve({ _id: 1 });
      else resolve(latest);
    });
  });
};
UserSchema.statics.findUserByUsername = function findUserByUsername(username, callback) {
  this.findOne({
    username,
  }, '-password -salt', callback);
};

UserSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  startAt: 1,
});
UserSchema.index({ url: 'text', username: 'text', displayName: 'text' });
UserSchema.set('toJSON', { getters: true, virtuals: true });
UserSchema.pre('save', preSave);
UserSchema.pre('findOneAndUpdate', preUpdate);
export default mongoose.model('User', UserSchema);
