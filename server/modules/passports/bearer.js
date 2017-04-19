/**
 * Created by andh on 8/1/16.
 */
import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';
import Jwt from 'jsonwebtoken';
import User from '../../models/user';
import config from '../../config';
export default () => {
  passport.use(new BearerStrategy.Strategy({},
        (token, done) => {
          console.log(`TOKEN ${token}`);
          if (token === config.guestToken) {
            console.log('guest');
            return done(null, 'guest');
          }
          Jwt.verify(token, config.key, (err, decoded) => {
            // console.log('exp', decoded.expired);
            // console.log('date', Date.now());
            if (decoded === undefined || !decoded.expired || decoded.expired < Date.now()) {
              return done(null, false);
            }
            User.findOne({ email: decoded.email }, (error, user) => {
              if (error || !user) {
                return done(null, false);
              }
              return done(null, user);
            });
            return null;
          });
          return null;
        }));
};
