/**
 * Created by andh on 3/17/17.
 */
import passport from 'passport';
// var users = require('../controllers/user.server.controller.js');
import { Router } from 'express';
const router = new Router();

router.route('/facebook').get((req, res, next) => {
  console.log(req);
  const request = req;
  request.session.redirect = request.query.redirect || '/';
  next();
}, passport.authenticate('facebook', { scope: ['user_friends', 'email', 'public_profile'] }));
router.route('/facebook/callback').get(passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
  res.redirect(`${req.session.redirect.split('?')[0]}?access_token=${req.user.token}`);
});

router.route('/google').get((req, res, next) => {
  const request = req;
  request.session.redirect = request.query.redirect || '/';
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.route('/google/callback').get(passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect(`${req.session.redirect.split('?')[0]}?access_token=${req.user.token}`);
});

export default router;
