import Skill from '../models/skill.model';
import Knowing from '../models/knowing.model';
import { redisGet, redisCheckExist, redisUpdate } from '../util/redis';
const npp = 6;

export async function list(req, res) {
  // process limit & skip
  const paging = parseInt(req.query.paging, 10) || npp;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = page > 0 ? ((page - 1) * paging) : 0;

  // process match
  const conds = [];
  if (req.query.root) conds.push({ root: req.query.root });
  if (req.query.isRoot) conds.push({ isRoot: req.query.isRoot.trim().toLowerCase() === 'true' });
  if (req.query.text) conds.push({ title: { $regex: req.query.text, $options: 'i' } });
  try {
    if (req.query.recommend && req.query.recommend.trim().toLowerCase() === 'true') {
      const _project = { skill: 1, level: 1 };
      const _match = { user: req.user._id };
      const knowings = await Knowing.list({ project: _project, match: _match });
      const knowingsLength = knowings.length;
      const today = new Date();
      const skills = [];
      for (let i = 0; i < knowingsLength; i++) {
        const knowing = knowings[i];
        if (await redisCheckExist(JSON.stringify(knowing.skill)) !== -2) {
          const skillRedis = JSON.parse(await redisGet(knowing.skill));
          const newSkillRedis = [];
          const skillRedisLength = skillRedis.length;
          // kiểm tra xem còn bao nhiêu ngày còn hạn
          for (let j = 0; j < skillRedisLength; j++) {
            const value = skillRedis[j];
            if (today.getTime() - new Date(value.time) < (7 * 24 * 60 * 60 * 1000)) newSkillRedis.push({ time: value.time, searchCount: value.time });
          }
          // nếu còn ngày còn hạn
          if (newSkillRedis.length > 0) skills.push(knowing.skill);
          // update redis những ngày còn hạn
          if (newSkillRedis.length < skillRedis.length) {
            await redisUpdate(knowing.skill, JSON.stringify(newSkillRedis));
          }
        }
      }
      conds.push({ _id: { $in: skills } });
    }
    let match = null;
    if (!conds.length) match = {};
    else if (conds.length === 1) match = conds.pop();
    else match = { $and: conds };

    // process process
    const project = {
      slug: 1, title: 1, root: 1, isRoot: 1, buffScore: 1,
    };

    // process sort
    let sort;

    const results = await Skill.list({ match, project, sort, skip, paging });
    return res.json({ data: results });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function create(req, res) {
  const skill = req.body;
  try {
    await Skill.add(skill);
    return res.status(200).send({ message: 'Add skill success' });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function update(req, res) {
  const skill = req.body;
  skill._id = req.skill._id;
  try {
    await Skill.updateById(skill);
    return res.status(200).send({ message: 'Update skill success' });
  } catch (err) {
    console.log(err.message);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export async function skillBySkillId(req, res, next, id) {
  try {
    const skill = await Skill.getById(id);
    const request = req;
    request.skill = skill;
    return next();
  } catch (err) {
    // console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function skillBySkillSlug(req, res, next, slug) {
  try {
    const skill = await Skill.getBySlug(slug);
    const request = req;
    request.skill = skill;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export function get(req, res) {
  console.log(req.skill);
  return res.status(200).send({ data: req.skill });
}

export async function remove(req, res) {
  const skill = req.skill;
  try {
    await Skill.remove(skill);
    return res.status(200).send({ message: 'Remove skill success' });
  } catch (err) {
    // console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
