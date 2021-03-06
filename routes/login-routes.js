'use strict';
const router = require('express').Router();
const passport = require('../scripts/passportGoogle.js');

router.use(require('express-session')({
  secret: 'whatdoesthisevendo', 
  resave: true, 
  saveUninitialized: true 
}));

router.use(passport.initialize());
router.use(passport.session());

router.get('/login', (req, res) => {
  res.send(`<a href="/login/google">Log In with Google</a>`);
});

router.get('/login/google', 
  passport.authenticate('google', {scope: ['profile']}));

router.get('/login/google/return', 
  passport.authenticate('google', {failureRedirect: '/login'}),
  function(req, res) {
    // console.log(req.user);
    res.redirect('/user');
  });

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/profile', (req, res) => {
  res.json(req.user);
});

module.exports = router;