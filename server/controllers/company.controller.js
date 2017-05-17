import Company from '../models/company.model';
import { writeFileFromByte64, createFolder, checkExist, removeF } from '../util/file';
const npp = 6;
const storeDir = `${__dirname}/../../public/uploaded/companies/`;


export async function list(req, res) {
  // process limit & skip
  const paging = parseInt(req.query.paging, 10) || npp;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = page > 0 ? ((page - 1) * paging) : 0;

  // process match
  const conds = [];
  if (req.query.text) conds.push({ name: { $regex: req.query.text, $options: 'i' } });
  if (req.query.skills) conds.push({ skills: { $all: req.query.skills.trim().split(',') } });
  if (req.query.verified) conds.push({ verified: req.query.verified === 'true' });

  let match = null;
  if (!conds.length) match = {};
  else if (conds.length === 1) match = conds.pop();
  else match = { $and: conds };

  // process process
  const project = {
    name: 1, manager: 1, slug: 1, overview: 1, avatar: 1, cover: 1,
    skills: 1, mobile: 1, email: 1, verified: 1, starCount: 1,
  };

  // process sort
  let sort;
  if (!req.query.sort || req.query.sort === 'name') {
    sort = { name: -1 };
  } else if (req.query.sort === 'star') {
    sort = { starCount: -1 };
  }
  try {
    const results = await Company.list({ match, project, sort, skip, paging });
    return res.json({ data: results });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export async function create(req, res) {
  const company = req.body;
  const latest = await Company.findLatestCompany();
  const newId = latest._id + 1;
  const basePath = `${storeDir}${newId}`;
  try {
    if (company.avatar || company.cover) {
      await createFolder(basePath);
      if (company.avatar) {
        const byte64 = company.avatar.replace(/^data:(video|image)\/(jpeg|mp4);base64,/, '');
        company.avatar = `uploaded/companies/${newId}/avatar.jpeg`;
        const avatarPath = `${basePath}/avatar.jpeg`;
        await writeFileFromByte64(avatarPath, byte64);
      }
      if (company.cover) {
        const byte64 = company.cover.replace(/^data:(video|image)\/(jpeg|mp4);base64,/, '');
        company.cover = `uploaded/companies/${newId}/cover.jpeg`;
        const coverPath = `${basePath}/cover.jpeg`;
        await writeFileFromByte64(coverPath, byte64);
      }
    }
    await Company.add(company);
    return res.status(200).send({ message: 'Add company success' });
  } catch (err) {
    await removeF(basePath);
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function update(req, res) {
  const company = req.body;
  company._id = req.company._id;
  try {
    if (company.avatar || company.cover) {
      const basePath = `${storeDir}${req.company._id}`;
      if (!(await checkExist(basePath))) await createFolder(basePath);
      if (company.avatar && company.avatar.length > 100) {
        const byte64 = company.avatar.replace(/^data:image\/jpeg;base64,/, '');
        company.avatar = `uploaded/companies/${req.company._id}/avatar.jpeg`;
        const avatarPath = `${basePath}/avatar.jpeg`;
        await removeF(avatarPath);
        await writeFileFromByte64(avatarPath, byte64);
      }
      if (company.cover && company.cover.length > 100) {
        const byte64 = company.cover.replace(/^data:image\/jpeg;base64,/, '');
        company.cover = `uploaded/companies/${req.company._id}/cover.jpeg`;
        const coverPath = `${basePath}/cover.jpeg`;
        await removeF(coverPath);
        await writeFileFromByte64(coverPath, byte64);
      }
    }
    await Company.updateById(company);
    return res.status(200).send({ message: 'Update company success' });
  } catch (err) {
    console.log(err.message);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export async function companyByCompanyId(req, res, next, id) {
  try {
    const company = await Company.getById(id);
    const request = req;
    request.company = company;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function companyByCompanySlug(req, res, next, slug) {
  try {
    const company = await Company.getBySlug(slug);
    const request = req;
    request.company = company;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export function get(req, res) {
  return res.status(200).send({ data: req.company });
}

export async function remove(req, res) {
  const company = req.company;
  const basePath = `${storeDir}${company._id}`;
  try {
    await removeF(basePath);
    await Company.remove(company);
    return res.status(200).send({ message: 'Remove company success' });
  } catch (err) {
    // console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
