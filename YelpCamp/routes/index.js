const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const middleware = require("../middleware"); //if a dir is required "index.js" is automatically required

//root route
router.get("/", (req, res) => {
  res.render("landing");
})

//show register form
router.get("/register", (req, res) => {
  res.render("register");
});
//handle signup logic
router.post("/register", (req, res) => {
  User.register({username: req.body.username, displayName: req.body.displayName}, req.body.password, (err, user) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        req.flash("success", "Welcome to YelpCamp " + user.displayName);
        res.redirect("/campgrounds");
      });
    }
  });
});

//show login form
router.get("/login", (req, res) => {
  res.render("login");
});
//handle login logic
router.post("/login", passport.authenticate("local",
  {successRedirect: "/campgrounds",
   failureRedirect: "/login"
  }), (req, res) => {
});

//facebook route
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/campgrounds',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
//    req.flash("success", "Welcome back " + req.user.displayName);
    res.redirect('/campgrounds');
});

//google route
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
router.get("/auth/google/campgrounds",
  passport.authenticate("google", { failureRedirect: "/login"}),
  (req, res) => {
//    req.flash("success", "Welcome back " + req.user.displayName);
    res.redirect("/campgrounds");
});

//logout ROUTE
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/campgrounds");
});


module.exports = router;
