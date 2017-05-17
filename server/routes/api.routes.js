import { Router } from 'express';
import passport from 'passport';
import * as comments from '../controllers/comment.controller';
import * as companies from '../controllers/company.controller';
import * as knowings from '../controllers/knowing.controller';
import * as posts from '../controllers/post.controller';
// import * as ProviderController from '../controllers/post.controller';
// import * as RoleController from '../controllers/post.controller';
import * as searchLogs from '../controllers/searchLog.controller';
import * as skills from '../controllers/skill.controller';
import * as users from '../controllers/user.controller';
import * as roles from '../controllers/role.controller';
import * as providers from '../controllers/provider.controller';
const router = new Router();


router.use(passport.authenticate('bearer', { session: false }), users.isSuspended);
/* TOKEN */
router.get('/token', users.authToken);
// // User

router.route('/users')
    .get(users.list)
    .post(users.create)
    .put(users.update);
router.route('/users/:user_id')
    .put(users.update)
    .delete(users.remove)
    .get(users.get);
router.route('/users/:user_id/managers')
    .put(users.update);
router.route('/users-slug/:user_slug')
    .get(users.get);
router.param('user_slug', users.userByUserSlug);
router.param('user_id', users.userByUserId);

// // SearchLog
router.route('/searchLogs')
    .get(searchLogs.list)
    .post(searchLogs.create);

// // Knowing
router.route('/knowings')
    .get(knowings.list)
    .post(knowings.create);
router.route('/knowings/:knowing_id')
    .put(knowings.update)
    .delete(knowings.remove)
    .get(knowings.get);
router.param('knowing_id', knowings.knowingByKnowingId);

// Post
router.route('/posts')
    .get(posts.list)
    .post(posts.create);
router.route('/posts/:post_id')
    .put(posts.update)
    .delete(posts.remove)
    .get(posts.get);
router.route('/posts/:post_id/comments')
    .get(comments.list)
    .post(comments.create);
router.route('/posts/:post_id/comments/:comment_id')
    .put(comments.update)
    .delete(comments.remove)
    .get(comments.get);
router.route('/posts/:post_id/comments/:comment_id/star')
    .put(comments.vote);
router.route('/posts/:post_id/star')
     .put(posts.vote);
router.route('/posts/:post_id/share')
    .put(posts.share);
router.route('/posts-slug/:post_slug')
    .get(posts.get);
router.param('post_id', posts.postByPostId);
router.param('post_slug', posts.postByPostSlug);
router.param('comment_id', comments.commentByCommentId);


// // Skill
router.route('/skills')
    .get(skills.list)
    .post(skills.create);
router.route('/skills/:skill_id')
    .put(skills.update)
    .delete(skills.remove)
    .get(skills.get);
router.route('/skills-slug/:skill_slug')
    .get(skills.get);
router.param('skill_id', skills.skillBySkillId);
router.param('skill_slug', skills.skillBySkillSlug);

// // Company
router.route('/companies')
    .get(companies.list)
    .post(companies.create);
router.route('/companies/:company_id')
    .put(companies.update)
    .delete(companies.remove)
    .get(companies.get);
router.route('/companies-slug/:company_slug')
    .get(companies.get);
router.param('company_id', companies.companyByCompanyId);
router.param('company_slug', companies.companyByCompanySlug);


// // Role
router.route('/roles')
    .get(roles.list)
    .post(roles.create);

// // Provider
router.route('/providers')
    .get(providers.list)
    .post(providers.create);
export default router;
