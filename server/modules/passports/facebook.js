import FacebookStrategy from 'passport-facebook';
import Jwt from 'jsonwebtoken';
import config from '../../config';
import User from '../../models/user.model';
function locdau(str) {
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
  return text;
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
export default (passport) => {
  const strategy = new FacebookStrategy.Strategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: config.facebook.profileFields,
    passReqToCallback: true,
  }, (req, accessToken, refreshToken, profile, done) => {
    const providerData = profile._json;
    providerData.accessToken = accessToken;
    providerData.refreshToken = refreshToken;
    let username = (profile.emails) ? profile.emails[0].value.split('@')[0] : locdau(profile.displayName);
    username = username.substring(0, 14);
    const email = profile.emails ? profile.emails[0].value : (`${username}@product.email`);
    const expired = Date.now() + 45 * 24 * 60 * 60 * 1000;
    const tokenData = {
      email,
      expired,
    };
    const token = Jwt.sign(tokenData, config.key);
    const providerUserProfile = {
      email,
      username,
      displayName: username,
      token,
      avatar: `https://graph.facebook.com/${profile.id}/picture?width=150&height=150`,
      provider: 'facebook',
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
