/**
 * Created by andh on 7/19/16.
 */
import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import config from '../config';
const Schema = mongoose.Schema;
const connection = mongoose.createConnection(config.mongoURL);
autoIncrement.initialize(connection);
const UserSchema = new Schema({
  displayName: String,
  username: {
    type: String,
    unique: true,
    required: 'Username is required',
    match: [/^[A-Za-z0-9_.]{1,15}$/, 'Please fill a valid username'],
    trim: true,
  },
  email: {
    type: String,
    match: [/\S+@\S+\.\S+/, 'Please fill a valid e-mail address'],
    required: 'Email is required',
    unique: true,
  },
  avatar: String,
  mobile: Number,
  provider: {
    type: String,
    required: 'Provider is required',
  },
  providerId: String,
  providerData: {},
  token: String,
  active: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },

});
UserSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  startAt: 1,
});


UserSchema.statics.findUniqueUsername = function (username, suffix,
    callback) {
  const _this = this;
  const possibleUsername = username + (suffix || '');
  _this.findOne({
    username: possibleUsername,
  }, (err, user) => {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) +
                    1, callback);
      }
    } else {
      return callback(null);
    }
    return false;
  });
};
UserSchema.set('toJSON', { getters: true, virtuals: true });
export default mongoose.model('User', UserSchema);
