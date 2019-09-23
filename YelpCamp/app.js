//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const seedDB = require("./seeds");
const Comment = require("./models/comment");
const User = require("./models/user");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

// const LocalStrategy = require("passport-local");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

// PASSPORT CONFIGURATION
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/campgrounds",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  (accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({ googleId: profile.id}, (err, user) => {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/campgrounds"
  },
  (accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({ facebookId: profile.id }, (err, user) => {
      return cb(err, user);
    });
  }
));


mongoose.connect("mongodb://localhost:27017/yelpDB", {useFindAndModify: false, useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

seedDB();

app.get("/", (req, res) => {
  res.render("landing");
})

// INDEX ROUTE
app.get("/campgrounds", (req, res) => {
  Campground.find((err, foundCampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {campgrounds: foundCampgrounds});
    }
  });
});

// CREATE ROUTE
app.post("/campgrounds", (req, res) => {
  const newCampground = new Campground({
    name: req.body.name,
    image: req.body.image,
    description: req.body.description
  });
  newCampground.save(err => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("campgrounds");
    }
  });
});

// NEW ROUTE
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// SHOW ROUTE
app.get("/campgrounds/:id", (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

// ======================
// COMMENTS ROUTES
// ======================

app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  });
});

app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(err);
        } else {
          foundCampground.comments.push(comment);
          foundCampground.save(err => {
            if (err) {
              console.log(err);
            } else {
              res.redirect("/campgrounds/" + foundCampground._id);
            }
          });
        }
      });
    }
  });
});


// AUTH ROUTES

//show register form
app.get("/register", (req, res) => {
  res.render("register");
});
//handle signup logic
app.post("/register", (req, res) => {
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

//facebook route
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/campgrounds',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
    res.redirect('/campgrounds');
});

//google route
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/campgrounds",
  passport.authenticate("google", { failureRedirect: "/login"}),
  (req, res) => {
    res.redirect("/campgrounds");
});

//show login form
app.get("/login", (req, res) => {
  res.render("login");
});
//handle login logic
app.post("/login", passport.authenticate("local",
  {successRedirect: "/campgrounds",
   failureRedirect: "/login"
  }), (req, res) => {
});

//logout ROUTE
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
