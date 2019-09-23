const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

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
  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
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
    res.redirect('/campgrounds');
});

//google route
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
router.get("/auth/google/campgrounds",
  passport.authenticate("google", { failureRedirect: "/login"}),
  (req, res) => {
    res.redirect("/campgrounds");
});

//logout ROUTE
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/campgrounds");
});

//middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}


module.exports = router;
