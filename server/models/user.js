import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import autoIncrement from 'mongoose-auto-increment';
import serverConfig from '../configs/server.config.js';
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
    trim: true,
  },
  token: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  company: {
    type: Number,
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
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  lastTime: {
    type: Date,
    default: Date.now,
  },
  provider: {
    type: Number,
    required: 'Require provider',
  },
  providerId: {
    type: Number,
  },
  providerData: {
    type: Object,
  },
  resetPasswordToken: {
    type: String,
    trim: true,
  },
  resetPasswordExpires: {
    type: Date,
    default: Date.now,
  },


});
UserSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  startAt: 1,
});
UserSchema.index({ title: 'text', description: 'text' });
UserSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('User', UserSchema);
