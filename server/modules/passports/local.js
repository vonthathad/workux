import PassportLocal from 'passport-local';
const LocalStrategy = PassportLocal.Strategy;
import mongoose from 'mongoose';
const User = mongoose.model('User');
// import User from '../../models/user.model';
export default (passport) => {
  passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({
      username,
    }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, {
          message: 'Tài khoản không tồn tại',
        });
      }
      if (!user.authenticate(password)) {
        return done(null, false, {
          message: 'Sai mật khẩu',
        });
      }
      return done(null, user);
    });
  }));
};
