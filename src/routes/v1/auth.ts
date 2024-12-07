import express, { Router } from "express";
import passport from "passport";
import { authenticated } from "../../services/passport";

const router: Router = express.Router();

router.get('/login', passport.authenticate('google'))

router.get('/callback', passport.authenticate('google', {
  failureRedirect: '/api/v1/auth/login',
  successRedirect: '/'
}));

router.get('/me', authenticated, (req, res) => {
  res.json(req.user);
})

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

export default router;