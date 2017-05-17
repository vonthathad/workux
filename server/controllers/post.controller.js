import Post from '../models/post.model';
import { writeFileFromByte64, createFolder, checkExist, removeF } from '../util/file';
const npp = 6;
const storeDir = `${__dirname}/../../public/uploaded/posts/`;

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
  if (req.query.skills) {
    let skills;
    if (skills instanceof Array) {
      skills = { $all: req.query.skills.map((skill) => { return parseInt(skill, 10); }) };
    } else {
      skills = parseInt(req.query.skills, 10);
    }
    conds.push({ skills });
  }
  let match = null;

  // process process
  const project = {
    content: 1, createdTime: 1, description: 1,
    from: 1, company: 1, publish: 1, skills: 1, slug: 1, thumb: 1, title: 1, updatedTime: 1,
    userShares: 1, userStars: 1, viewCount: 1,
  };

  // process sort
  try {
    let sort;
    let results;
    if (!req.query.sort || req.query.sort === 'newest') {
      sort = { createdTime: -1 };
      if (!conds.length) match = {};
      else if (conds.length === 1) match = conds.pop();
      else match = { $and: conds };
      results = await Post.list({ match, project, sort, skip, paging });
      return res.json({ data: results });
    } else if (req.query.sort === 'popular' || req.query.sort === 'feed') {
      // get post of threeday ago and calc engage points
      const threeDayAgo = new Date((new Date()) - 3 * 24 * 60 * 60 * 1000);
      const fiveHourAgo = new Date((new Date()) - 5 * 60 * 60 * 1000);
      // nếu là popular thì lọc hết những bài quá 3 ngày
      if (req.query.sort === 'popular') conds.push({ createdTime: { $gte: threeDayAgo } });
      // nếu là feed thì lọc hết những bài không liên quan
      else {
        const skills = req.user.followSkills;
        const followUsers = req.user.followUsers.map((value) => { return parseInt(value, 10); });
        const followCompanies = req.user.followCompanies.map((value) => { return parseInt(value, 10); });
        const feedConditions = [
          { from: { $in: followUsers } },
          { company: { $in: followCompanies } },
        ];
        skills.forEach((skill) => {
          feedConditions.push({ skills: parseInt(skill, 10) });
        });
        conds.push({
          $or: feedConditions,
        });
      }
      const numberOnlines = 1000;
      // project = { countPoint: '$engage' };
      const _project = { ...project };
      Object.keys(project).map((key) => { project[key] = { $first: `$${key}` }; return key; });
      const engage = { $sum: { $add: [1, { $multiply: [2, { $size: '$userShares' }] }, { $size: '$userStars' }] } };
      const creator = { $add: [1, { $divide: ['$from.starCount', numberOnlines] }] };
      // x
      const timePassed = { $divide: [{ $subtract: [new Date(), '$createdTime'] }, 60 * 60 * 1000] };
      const sqrt2 = Math.sqrt(2);
      // 1/(sqrt(2)*log(x - 2.5 ))
      const formula = { $divide: [1, { $multiply: [sqrt2, { $log: [{ $subtract: [timePassed, 2.5] }, 10] }] }] };
      const time = {
        $cond: {
          if: { $gte: ['$createdTime', fiveHourAgo] },
          then: 1.5,
          else: formula,
        },
      };
      const group = { _id: '$_id', ...project, engage };
      if (!conds.length) match = {};
      else if (conds.length === 1) match = conds.pop();
      else match = { $and: conds };
      // results = await Post.list({ match, sort, skip, paging, group, project: _project });
      if (req.query.sort === 'popular') {
        Post.aggregate([
          { $match: match },
          { $skip: skip },
          { $limit: paging },
          { $group: group },
          {
            $lookup: {
              from: 'users',
              localField: 'from',
              foreignField: '_id',
              as: 'from',
            },
          },
          { $unwind: '$from' },
          // { $project: { ..._project, engage: 1, creator: { $add: [1, { $divide: ['$from.starCount', numberOnlines] }] } } },
          { $project: { ..._project, point: { $multiply: ['$engage', creator, time] } } },
          { $sort: { point: -1 } },
        ], (err, _results) => {
          if (err) console.log(err);
          console.log(_results);
          console.log(req.user);
          res.json({ data: _results });
        });
      } else if (req.query.sort === 'feed') {
        const searchSkills = req.user.searchSkills.map((skill) => { return parseInt(skill, 10); });
        // tính tổng buffScore, nếu là skill mà user đang tìm thì + 1 / mỗi skill
        const skill = {
          $sum: {
            $cond: {
              if: { $in: ['$skills._id', searchSkills] },
              then: { $add: ['$skills.buffScore', 1] },
              else: '$skills.buffScore',
            },
          },
        };
        Post.aggregate([
          { $match: match },
          { $skip: skip },
          { $limit: paging },
          { $group: group },
          {
            $lookup: {
              from: 'users',
              localField: 'from',
              foreignField: '_id',
              as: 'from',
            },
          },
          { $unwind: { path: '$from', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'skills',
              localField: 'skills',
              foreignField: '_id',
              as: 'skills',
            },
          },
          { $unwind: { path: '$skills', preserveNullAndEmptyArrays: true } },
          // { $project: { ..._project, point: { $multiply: ['$engage', creator, time] } } },
          { $group: { ...group, point: { $first: { $multiply: ['$engage', creator, time, skill] } } } },
          { $sort: { point: -1 } },
        ], (err, _results) => {
          if (err) console.log(err);
          res.json({ data: _results });
        });
      }
    }
    return null;
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function create(req, res) {
  const post = req.body;
  const latest = await Post.findLatestPost();
  const newId = latest._id + 1;
  post.from = req.user._id;
  const basePath = `${storeDir}${newId}`;
  try {
    if (post.thumb) {
      const byte64 = post.thumb.replace(/^data:(video|image)\/(jpeg|mp4);base64,/, '');
      post.thumb = `uploaded/posts/${newId}/thumb.jpeg`;
      const thumbPath = `${basePath}/thumb.jpeg`;
      if (!(await checkExist(basePath))) await removeF(basePath);
      await createFolder(basePath);
      await writeFileFromByte64(thumbPath, byte64);
    }
    await Post.add(post);
    return res.status(200).send({ message: 'Add post success' });
  } catch (err) {
    await removeF(basePath);
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function update(req, res) {
  const post = req.body;
  post._id = req.post._id;
  post.from = req.user._id;
  try {
    if (post.thumb && post.thumb.length > 100) {
      const byte64 = post.thumb.replace(/^data:image\/jpeg;base64,/, '');
      post.thumb = `uploaded/posts/${req.post._id}/thumb.jpeg`;
      const basePath = `${storeDir}${req.post._id}`;
      const thumbPath = `${basePath}/thumb.jpeg`;
      if (!(await checkExist(basePath))) await createFolder(basePath);
      await removeF(thumbPath);
      await writeFileFromByte64(thumbPath, byte64);
    }
    await Post.updateById(post);
    return res.status(200).send({ message: 'Update post success' });
  } catch (err) {
    console.log(err.message);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export async function postByPostId(req, res, next, id) {
  try {
    const post = await Post.getById(id);
    const request = req;
    request.post = post;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function postByPostSlug(req, res, next, slug) {
  try {
    const post = await Post.getBySlug(slug);
    const request = req;
    request.post = post;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export function get(req, res) {
  return res.status(200).send({ data: req.post });
}

export async function remove(req, res) {
  const post = req.post;
  const basePath = `${storeDir}${post._id}`;
  try {
    await removeF(basePath);
    await Post.remove(post);
    return res.status(200).send({ message: 'Remove post success' });
  } catch (err) {
    // console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}


function voteUp(postId, userId) {
  return new Promise((resolve, reject) => {
    Post.findByIdAndUpdate(postId, {
      $addToSet: { userStars: userId },
    }, { new: true }).exec((err, post) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve(post);
    });
  });
}
function voteDown(postId, userId) {
  return new Promise((resolve, reject) => {
    Post.findByIdAndUpdate(postId, {
      $pull: { userStars: userId },
    }, { new: true }).exec((err, post) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve(post);
    });
  });
}
export async function vote(req, res) {
  let isVoted = false;
  req.post.userStars.forEach((userId) => {
    if (userId === req.user._id) isVoted = true;
    return;
  });
  try {
    const post = !isVoted ? await voteUp(req.post._id, req.user._id) : await voteDown(req.post._id, req.user._id);
    return res.status(200).send({ data: { voted: !isVoted, votes: post.userStars } });
  } catch (message) {
    console.log(message);
    return res.status(message.code).send();
  }
}


function _share(postId, userId) {
  return new Promise((resolve, reject) => {
    Post.findByIdAndUpdate(postId, {
      $addToSet: { userShares: userId },
    }, { new: true }).exec((err, post) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve(post);
    });
  });
}
export async function share(req, res) {
  let isShared = false;
  req.post.userShares.forEach((userId) => {
    if (userId === req.user._id) isShared = true;
    return;
  });
  try {
    if (!isShared) await _share(req.post._id, req.user._id);
    return res.status(200).send({ data: { shared: !isShared } });
  } catch (message) {
    console.log(message);
    return res.status(message.code).send();
  }
}
