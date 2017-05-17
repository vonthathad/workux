import Role from '../models/role.model';
const npp = 6;


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
    const skillList = [];
    req.query.skills.forEach((skill) => { skillList.push({ skills: skill }); });
    if (skillList.length) { conds.push({ $or: skillList }); }
  }

  let match = null;
  if (!conds.length) match = {};
  else if (conds.length === 1) match = conds.pop();
  else match = { $and: conds };

  // process process
  const project = {
    roleName: 1,
  };

  // process sort
  let sort;
  if (!req.query.sort) {
    sort = { _id: -1 };
  }

  try {
    const results = await Role.list({ match, project, sort, skip, paging });
    return res.json({ data: results });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function create(req, res) {
  const role = req.body;
  role.from = req.user._id;
  try {
    await Role.add(role);
    return res.status(200).send({ message: 'Add role success' });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
