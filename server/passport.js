/**
 * Created by andh on 3/17/17.
 */
import bearer from './modules/passports/bearer';
import local from './modules/passports/local';
import facebook from './modules/passports/facebook';
import google from './modules/passports/google';
import User from './models/user.model';
export default (passport) => {
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
  local(passport);
  facebook(passport);
  google(passport);
  // require('./passports/bearer')();
  // require('./passports/facebook')();
};
