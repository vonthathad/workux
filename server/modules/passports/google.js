import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import Jwt from 'jsonwebtoken';
import config from '../../config';
import User from '../../models/user';

function filter(str) {
  let text = str;
  text = text.toLowerCase();
  text = text.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  text = text.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  text = text.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  text = text.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  text = text.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  text = text.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  text = text.replace(/đ/g, 'd');
  text = text.replace(/[$&+,:;=?@#|'<>.^*()%! -]/g, '');
  text = text.replace(/ /g, '');
  return str;
}
const saveOAuthUserProfile = (req, providerUserProfile, done) => {
  const profile = providerUserProfile;
  User.findOne({
    provider: profile.provider,
    providerId: profile.providerId,
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      const possibleUsername = profile.username;
      User.findUniqueUsername(possibleUsername, null,
        (availableUsername) => {
          profile.username = availableUsername;
          const newUser = new User(profile);
          newUser.save((error, userSaved) => {
            if (error) {
              return req.res.redirect('/');
            }
            return done(err, userSaved);
            // return done(err, user.toObject({ virtuals: true }));
          });
        });
    } else {
      const existUser = user;
      existUser.providerData = profile.providerData;
      existUser.token = profile.token;
      existUser.save();
      return done(err, existUser);
    }
    return null;
  });
};
export default () => {
  const strategy = new GoogleStrategy({
            // clientID: config.facebook.clientID,
            // clientSecret: config.facebook.clientSecret,
            // callbackURL: config.facebook.callbackURL,
            // profileFields: config.facebook.profileFields,
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    passReqToCallback: true,
  },
    (req, accessToken, refreshToken, profile, done) => {
      const providerData = profile._json;
      providerData.accessToken = accessToken;
      providerData.refreshToken = refreshToken;
      let username = (profile.emails) ? profile.emails[0].value.split('@')[0] : filter(profile.displayName);
      username = username.substring(0, 13);
      const email = profile.emails ? profile.emails[0].value : `${username}@crowdbam.com`;
      const tokenData = {
        email,
      };
      let avatar = profile.photos[0].value.split('sz=')[0];
      avatar += 'sz=150';
      const token = Jwt.sign(tokenData, config.key);
      const providerUserProfile = {
        email,
        username,
        displayName: username,
        token,
        avatar,
        isVerified: true,
        provider: 'google',
        providerId: profile.id,
        providerData,
      };
      if (profile.displayName) {
        providerUserProfile.displayName = profile.displayName;
      }
      saveOAuthUserProfile(req, providerUserProfile, done);
    });
  passport.use(strategy);
};
