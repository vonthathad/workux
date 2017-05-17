/**
 * Created by andh on 8/4/16.
 */
import User from '../models/user.model';
import Knowing from '../models/knowing.model';
// import Jwt from 'jsonwebtoken';
// import Mail from '../configs/mail';
import serverConfig from '../config';
// const privateKey = serverConfig.key.privateKey;
// const https from'https');
import passport from 'passport';
import { writeFileFromByte64, createFolder, checkExist, removeF } from '../util/file';
const npp = 6;
const storeDir = `${__dirname}/../../public/uploaded/users/`;

export function authLogout(req, res) {
  req.logout();
  res.redirect('/');
}
export function login(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.json({ message: info.message }); }
    res.status(200).send({ data: user });
    return null;
  })(req, res, next);
}
export async function register(req, res) {
  try {
    const data = req.body;
    const result = await User.add(data);
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

// export function verifyEmail(req, res) {
//   const token = req.params.token;
// //   const app = {
// //     id: config.app.id,
// //     name: config.app.name,
// //     description: config.app.description,
// //     url: config.app.url,
// //     image: config.app.image,
// //   };
//   Jwt.verify(token, privateKey, (err, decoded) => {
//     if (decoded === undefined) {
//       const message = 'Token has expired :(';
//       return res.render('index', { message, app: serverConfig.app, channel: serverConfig.server.channel });
//     }
//     User.findOne({ email: decoded.email }, (err1, user) => {
//       if (err1) {
//         const message = 'Token has expired :(';
//         return res.render('index', { message, app: serverConfig.app, channel: serverConfig.server.channel });
//       }
//       if (user === null) {
//         const message = "Account doesn't exist";
//         return res.render('index', { message, app: serverConfig.app, channel: serverConfig.server.channel });
//       }
//       user.isVerified = true;
//       user.save((err2) => {
//         if (err2) {
//           const message = 'Error Occur. Please try again';
//           return res.render('index', { message, app: serverConfig.app, channel: serverConfig.server.channel });
//         }
//         const message = 'Congragulation! Account has verified';
//         return res.render('index', { message, app: serverConfig.app, channel: serverConfig.server.channel });
//       });
//       return null;
//     });
//     return null;
//   });
// }
// export function resetPage(req, res) {
//   User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
//     if (!user) {
//     //   const app = {
//     //     id: config.app.id,
//     //     name: config.app.name,
//     //     description: config.app.description,
//     //     url: config.app.url,
//     //     image: config.app.image,
//     //   };
//       const message = 'Token has expired :(';
//       return res.render('index', { message, user: null, app: serverConfig.app, channel: serverConfig.server.channel });
//     }
//     return res.redirect(`/action/password/${req.params.token}`);
//   });
// }
export function renderPassword(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (!user) {
      //   const app = {
      //     id: config.app.id,
      //     name: config.app.name,
      //     description: config.app.description,
      //     url: config.app.url,
      //     image: config.app.image,
      //   };
      const message = 'Token has expired :(';
      return res.render('index', { message, user: null, app: serverConfig.app, channel: serverConfig.server.channel });
    }
    const message = 'Enter new password';
    return res.render('index', { message, user: null, app: serverConfig.app, channel: serverConfig.server.channel });
  });
}
// export function resetDone(req, res) {
//   User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
//     if (!user) {
//             // req.flash('error', 'Token để reset password không tồn tại, hoặc đã hết hạn.');
//             // return res.redirect('back');
//       const message = 'Token has expired :(';
//       return res.status(400).send({
//         message,
//       });
//     }
//         // console.log(req.body.password);
//     user.password = req.body.password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     user.save((err1) => {
//       if (err1) {
//         const message = 'Error occur. Please try again';
//         return res.status(400).send({
//           message,
//         });
//       }
//       Mail.sendMailDoneResetPassword(user);
//       const message = 'Change password success!';
//       return res.status(200).send({
//         data: user,
//         message,
//       });
//     });
//     return null;
//   });
// }
// export function resendVerificationEmail(req, res) {
//   User.findUserByUsername(req.body.email, (err, user) => {
//     if (!err) {
//       if (user === null) {
//         const message = "Account doesn't exist";
//         return res.status(400).send({
//           message,
//         });
//       }
//       if (user.isVerified === true) {
//         const message = 'Account has verified';
//         return res.status(400).send({
//           message,
//         });
//       }
//       const tokenData = {
//         email: user.email,
//       };
//       Mail.sentMailVerificationLink(user, Jwt.sign(tokenData, privateKey));
//       const message = 'Resend confirmation email success. Check your email to verify!';
//       return res.status(200).send({
//         message,
//       });
//     }
//     const message = 'Error occur. Please try again.';
//     return res.status(400).send({
//       message,
//     });
//   });
// }
// export function resetPassword(req, res) {
//   User.findOne({ email: req.body.email }, (err, user) => {
//     if (!err) {
//       if (user === null) {
//         const message = 'Tài khoản không tồn tại';
//         return res.status(400).send({
//           message,
//         });
//       }
//       crypto.randomBytes(20, (err1, buf) => {
//         if (err1) {
//           const message = 'Error occur. Please try again';
//           return res.status(400).send({
//             message,
//           });
//         }
//         const token = buf.toString('hex');
//         user.resetPasswordToken = token;
//         user.resetPasswordExpires = Date.now() + 3600000;
//         user.save((err2) => {
//           if (err2) {
//             const message = 'Error occur. Please try again';
//             return res.status(400).send({
//               message,
//             });
//           }
//           Mail.sendMailResetPassword(user, token);
//           const message = 'Success. Password change request has been sent to your email';
//           return res.status(200).send({
//             message,
//           });
//         });
//         return null;
//       });
//     } else {
//       const message = 'Error occur. Please try again';
//       return res.status(400).send({
//         message,
//       });
//     }
//     return null;
//   });
// }

// ////////////////////////////////////////////////
// //GET USER DATA, Header Authorization By Token
// ////////////////////////////////////////////////
export function authToken(req, res) {
  if (req.user) {
    req.user.save();
    return res.json({ user: req.user });
  }
  res.status(400).send();
  return null;
}


export function requiresLogin(req, res, next) {
  if (req.user === 'guest' || !req.isAuthenticated()) {
    return res.status(401).send({
      message: "User doesn't login",
    });
  } else if (req.user === 'ban') {
    return res.status(403).send({
      message: 'Your account is banned',
    });
  }
  next();
  return null;
}
export function requiresManager(req, res, next) {
  if (req.user.role === 'manager' || req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).send({
      message: "You doesn't have a permission",
    });
  }
  return null;
}

export function requiresAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).send({
      message: "You doesn't have a permission",
    });
  }
  return null;
}
export function isSuspended(req, res, next) {
  if (req.user.suspend) {
    return res.status(403).send({
      message: 'Nick của bạn đã bị banned',
    });
  }
  next();
  return null;
}


export async function list(req, res) {
  // process limit & skip
  const paging = parseInt(req.query.paging, 10) || npp;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = page > 0 ? ((page - 1) * paging) : 0;

  // process match
  const conds = [];
  if (req.query.company) conds.push({ company: parseInt(req.query.company, 10) });
  if (req.query.from) conds.push({ from: parseInt(req.query.from, 10) });
  if (req.query.text) {
    conds.push({
      $or: [
        { title: { $regex: req.query.text, $options: 'i' } },
        { content: { $regex: req.query.text, $options: 'i' } },
      ],
    });
  }

  let match = null;
  if (!conds.length) match = {};
  else if (conds.length === 1) match = conds.pop();
  else match = { $and: conds };

  // process process
  const project = {
    url: 1, username: 1, displayName: 1, password: 1, salt: 1, token: 1,
    avatar: 1, bio: 1, company: 1, suspend: 1, violation: 1, aph: 1, role: 1,
    createdTime: 1, lastTime: 1, provider: 1, providerId: 1, providerData: 1,
    searchSkills: 1, followUsers: 1, followCompanies: 1, followSkills: 1, editorScore: 1, starCount: 1,
  };
  let sort;
  if (!req.query.sort || req.query.sort === 'displayName') {
    sort = { displayName: -1 };
  } else if (req.query.sort === 'star') {
    sort = { starCount: -1 };
  }
  try {
    let results;
    if (req.query.skills) {
      let skills = req.query.skills;
      let skillMatch;
      if (skills instanceof Array) {
        skills = req.query.skills.map((skill) => { return parseInt(skill, 10); });
        skillMatch = { $in: skills };
      } else {
        skillMatch = parseInt(skills, 10);
      }
      const _project = { user: 1, skill: 1, level: 1 };
      const _match = { skill: skillMatch };
      const group = { _id: '$user', user: { $first: '$user' }, skills: { $push: { skill: '$skill', level: '$level' } } };
      results = await Knowing.list({ project: _project, match: _match, group });
      const path = 'user';
      const select = Object.keys(project).join(' ');
      results = await Knowing.merge({ source: results, path, match, sort, skip, paging, select });
    } else {
      results = await User.list({ match, project, sort, skip, paging });
    }
    return res.json({ data: results });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function create(req, res) {
  const user = req.body;
  const latest = await User.findLatestUser();
  const newId = latest._id + 1;
  const basePath = `${storeDir}${newId}`;
  try {
    if (user.avatar) {
      const byte64 = user.avatar.replace(/^data:(video|image)\/(jpeg|mp4);base64,/, '');
      user.avatar = `uploaded/users/${newId}/avatar.jpeg`;
      const avatarPath = `${basePath}/avatar.jpeg`;
      await createFolder(basePath);
      await writeFileFromByte64(avatarPath, byte64);
    }
    await User.add(user);
    return res.status(200).send({ message: 'Add user success' });
  } catch (err) {
    await removeF(basePath);
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function update(req, res) {
  const user = req.body;
  user._id = req.selectedUser ? req.selectedUser._id : req.user._id;
  console.log(req.selectedUser);
  // user._id = req.user._id;
  try {
    if (user.avatar && user.avatar.length > 100) {
      const byte64 = user.avatar.replace(/^data:image\/jpeg;base64,/, '');
      user.avatar = `uploaded/users/${req.user._id}/avatar.jpeg`;
      const basePath = `${storeDir}${req.user._id}`;
      const avatarPath = `${basePath}/avatar.jpeg`;
      if (!(await checkExist(basePath))) await createFolder(basePath);
      await removeF(avatarPath);
      await writeFileFromByte64(avatarPath, byte64);
    }
    const updatedUser = await User.updateById(user);
    return res.status(200).send({ message: 'Update user success', token: updatedUser.token });
  } catch (err) {
    console.log(err.message);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export async function userByUserId(req, res, next, id) {
  try {
    const user = await User.getById(id);
    const request = req;
    request.selectedUser = user;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function userByUserSlug(req, res, next, slug) {
  try {
    const user = await User.getBySlug(slug);
    const request = req;
    request.selectedUser = user;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export function get(req, res) {
  return res.status(200).send({ data: req.user });
}

export async function remove(req, res) {
  const user = req.selectedUser;
  const basePath = `${storeDir}${user._id}`;
  try {
    await removeF(basePath);
    await User.remove(user);
    return res.status(200).send({ message: 'Remove user success' });
  } catch (err) {
    // console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
