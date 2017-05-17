import SearchLog from '../models/searchLog.model';
import Skill from '../models/skill.model';
import Knowing from '../models/knowing.model';
import { redisGet, redisCheckExist, redisUpdate, redisSetExpire } from '../util/redis';
const npp = 6;

export async function list(req, res) {
  // process limit & skip
  const paging = parseInt(req.query.paging, 10) || npp;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = page > 0 ? ((page - 1) * paging) : 0;
  try {
    // process match
    const conds = [];
    if (req.query.skill) conds.push({ skill: parseInt(req.query.skill, 10) });
    if (req.query.word) conds.push({ title: { $regex: req.query.text, $options: 'i' } });
    if (req.query.skills) {
      let skills;
      if (skills instanceof Array) {
        skills = { $all: req.query.skills.map((skill) => { return parseInt(skill, 10); }) };
      } else {
        skills = parseInt(req.query.skills, 10);
      }
      conds.push({ skills });
    }
    if (req.query.recommend && req.query.recommend === 'true') {
      const project = { skill: 1 };
      const match = { user: req.user._id };
      const knowings = await Knowing.list({ project, match });
      conds.push({ skills: { $all: knowings.map((knowing) => { return knowing.skill; }) } });
    }

    let match = null;
    if (!conds.length) match = {};
    else if (conds.length === 1) match = conds.pop();
    else match = { $and: conds };

    // process process
    const project = {
      text: 1, skills: 1, createdTime: 1,
    };
    // process sort
    let sort;
    if (!req.query.sort || req.query.sort === 'newest') {
      sort = { createdTime: -1 };
    } else if (req.query.sort === 'amount') {
      project.amount = { $size: '$skills' };
      sort = { amount: -1 };
    }

    const results = await SearchLog.list({ match, project, sort, skip, paging });
    return res.json({ data: results });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export async function create(req, res) {
  let searchLog = req.body;
  try {
    // check and create searchLog skill
    const project = { _id: 1 };
    const words = searchLog.text.trim().split(' ');
    const wLength = words.length;
    const skillIds = new Set();
    for (let i = 0; i < wLength; i++) {
      const match = { $text: { $search: words[i] } };
      const skills = await Skill.list({ project, match });
      const sLength = skills.length;
      for (let j = 0; j < sLength; j++) {
        skillIds.add(skills[j]._id);
      }
    }
    searchLog.skills = [...skillIds];

    searchLog = await SearchLog.add(searchLog);

    // add skill searched to searchList in redis
    const today = new Date();
    const skills = searchLog.skills;
    const skillsLength = skills.length;
    for (let i = 0; i < skillsLength; i++) {
      const skill = JSON.stringify(skills[i]);
      if (await redisCheckExist(skill) !== -2) {
        const skillRedis = JSON.parse(await redisGet(skill));
        const skillRedisLength = skillRedis.length;
        const newSkillRedis = [];
        for (let j = 0; j < skillRedisLength; j++) {
          const value = skillRedis[j];
          if (new Date(value.time).setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
            newSkillRedis.push({ time: value.time, searchCount: value.time + 1 });
          } else {
            if (today.getTime() - new Date(value.time > (7 * 24 * 60 * 60 * 1000))) newSkillRedis.push({ time: value.time, searchCount: value.time });
          }
        }
        await redisUpdate(skill, JSON.stringify(newSkillRedis));
      } else {
        await redisUpdate(skill, JSON.stringify([{ time: today, searchCount: 1 }]));
      }
      await redisSetExpire(skill, 7 * 24 * 60 * 60);
    }
    return res.status(200).send({ message: 'Add searchLog success' });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
