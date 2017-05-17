import Knowing from '../models/knowing.model';
const npp = 6;

export async function list(req, res) {
  // process limit & skip
  const paging = parseInt(req.query.paging, 10) || npp;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = page > 0 ? ((page - 1) * paging) : 0;

  // process match
  const conds = [];
  if (req.query.user) conds.push({ user: parseInt(req.query.user, 10) });
  if (req.query.level) conds.push({ level: parseInt(req.query.level, 10) });
  if (req.query.skill) conds.push({ skill: parseInt(req.query.skill, 10) });

  let match = null;
  if (!conds.length) match = {};
  else if (conds.length === 1) match = conds.pop();
  else match = { $and: conds };

  // process process
  const project = {
    user: 1, skill: 1, level: 1,
  };
  // process sort
  let sort;
  if (!req.query.sort || req.query.sort === 'skill') {
    sort = { skill: -1 };
  } else if (req.query.sort === 'level') {
    sort = { level: -1 };
  }
  try {
    const results = await Knowing.list({ match, project, sort, skip, paging });
    return res.json({ data: results });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function create(req, res) {
  const knowing = req.body;
  try {
    await Knowing.add(knowing);
    return res.status(200).send({ message: 'Add knowing success' });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function update(req, res) {
  const knowing = req.body;
  knowing._id = req.knowing._id;
  try {
    await Knowing.updateById(knowing);
    return res.status(200).send({ message: 'Update knowing success' });
  } catch (err) {
    console.log(err.message);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export async function knowingByKnowingId(req, res, next, id) {
  try {
    const knowing = await Knowing.getById(id);
    const request = req;
    request.knowing = knowing;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export function get(req, res) {
  return res.status(200).send({ data: req.knowing });
}

export async function remove(req, res) {
  const knowing = req.knowing;
  try {
    await Knowing.remove(knowing);
    return res.status(200).send({ message: 'Remove knowing success' });
  } catch (err) {
    // console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
