const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Campground = require("../models/campground");
const middleware = require("../middleware"); //if a dir is required "index.js" is automatically required
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
  User.register({username: req.body.username, email: req.body.username, displayName: req.body.displayName}, req.body.password, (err, user) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, () => {
        console.log('12');
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
   failureRedirect: "/login",
   failureFlash: "Invalid username or password.",
   successFlash: "Welcome back!"
  }), (req, res) => {
});

//facebook route
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/campgrounds',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect('/campgrounds');
});

//google route
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
router.get("/auth/google/campgrounds",
  passport.authenticate("google", { failureRedirect: "/login"}),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/campgrounds");
});

//logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "See you later!");
  res.redirect("/campgrounds");
});

//forgot password route
router.get("/forgot", (req, res) => {
  res.render("forgot");
});

router.post("/forgot", (req, res, next) => {
  async.waterfall([
    done => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          req.flash("error", "No account with that email address exists.");
          return res.redirect("/forgot");
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

        user.save(err => {
          done(err, token, user);
        });
      });
    },
    (token, user, done) => {
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "klokardev@gmail.com",
          pass: process.env.GMAILPW
        }
      });
      const mailOptions = {
        to: user.email,
        from: "naca1908@gmail.com",
        subject: "Node.js Password Reset",
        text: "You are receiving this because you (or someone else) have requested the reset of the password.\n" +
          "Please click on the following link, or paste this into your browser to complete the process.\n" +
          "http://" + req.headers.host + "/reset" + token + "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged."
      };
      smtpTransport.sendMail(mailOptions, err => {
        console.log("mail sent");
        req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
        done(err, "done");
      });
    }
  ], err => {
    if (err) {
      return next(err);
    } else {
      res.redirect("/forgot");
    }
  });
});

router.get("/reset:token", (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, (err, user) => {
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/forgot");
    }
    res.render("reset", {token: req.params.token});
  });
});

router.post("/reset/:token", function(req, res) {
  async.waterfall([
    done => {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("back");
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, err => {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(err => {
              req.logIn(user, err => {
                done(err, user);
              });
            });
          });
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect("back");
        }
      });
    },
    (user, done) => {
      var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "klokardev@gmail.com",
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: "klokardev@gmail.com",
        subject: "Your password has been changed",
        text: "Hello,\n\n" +
          "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
      };
      smtpTransport.sendMail(mailOptions, err => {
        req.flash("success", "Success! Your password has been changed.");
        done(err);
      });
    }
  ], err => {
    res.redirect("/campgrounds");
  });
});

module.exports = router;
