import Comment from '../models/comment.model';
const npp = 6;

export async function list(req, res) {
  // process limit & skip
  const paging = parseInt(req.query.paging, 10) || npp;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = page > 0 ? ((page - 1) * paging) : 0;

  // process match
  const conds = [];
  conds.push({ post: req.post._id });
  let match = null;
  if (!conds.length) match = {};
  else if (conds.length === 1) match = conds.pop();
  else match = { $and: conds };

  // process process
  const project = {
    createdTime: 1, post: 1, answer: 1, question: 1, position: 1, from: 1, userStars: 1,
  };

  // process sort
  let sort;
  try {
    const results = await Comment.list({ match, project, sort, skip, paging });
    return res.json({ data: results });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function create(req, res) {
  const comment = req.body;
  comment.from = req.user._id;
  comment.post = req.post._id;
  try {
    await Comment.add(comment);
    return res.status(200).send({ message: 'Add comment success' });
  } catch (err) {
    console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}
export async function update(req, res) {
  const comment = req.body;
  comment._id = req.comment._id;
  try {
    await Comment.updateById(comment);
    return res.status(200).send({ message: 'Update comment success' });
  } catch (err) {
    console.log(err.message);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export async function commentByCommentId(req, res, next, id) {
  try {
    const comment = await Comment.getById(id);
    const request = req;
    request.comment = comment;
    return next();
  } catch (err) {
    // console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}

export function get(req, res) {
  console.log(req.comment);
  return res.status(200).send({ data: req.comment });
}

export async function remove(req, res) {
  const comment = req.comment;
  try {
    await Comment.remove(comment);
    return res.status(200).send({ message: 'Remove comment success' });
  } catch (err) {
    // console.log(err);
    return res.status(err.code).send({ message: err.message, code: err.code });
  }
}


function voteUp(commentId, userId) {
  return new Promise((resolve, reject) => {
    Comment.findByIdAndUpdate(commentId, {
      $addToSet: { userStars: userId },
    }, { new: true }).exec((err, comment) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve(comment);
    });
  });
}
function voteDown(commentId, userId) {
  return new Promise((resolve, reject) => {
    Comment.findByIdAndUpdate(commentId, {
      $pull: { userStars: userId },
    }, { new: true }).exec((err, comment) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve(comment);
    });
  });
}
export async function vote(req, res) {
  let isVoted = false;
  req.comment.userStars.forEach((userId) => {
    if (userId === req.user._id) isVoted = true;
    return;
  });
  try {
    const comment = !isVoted ? await voteUp(req.comment._id, req.user._id) : await voteDown(req.comment._id, req.user._id);
    return res.status(200).send({ data: { voted: !isVoted, votes: comment.votes } });
  } catch (message) {
    console.log(message);
    return res.status(message.code).send();
  }
}
