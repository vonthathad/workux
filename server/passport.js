/**
 * Created by andh on 3/17/17.
 */
const passport = require('passport');
import bearer from './modules/passports/bearer';
import facebook from './modules/passports/facebook';
import User from './models/user';
export default () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id,
    }, '-password -salt', (err, user) => {
      done(err, user);
    });
  });
  bearer(passport);
  facebook(passport);
  // require('./passports/bearer')();
  // require('./passports/facebook')();
};
