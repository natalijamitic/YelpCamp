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

//requiring routes
const indexRoutes = require("./routes/index");
const commentRoutes = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");

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
    User.findOrCreate({ googleId: profile.id, displayName: profile.displayName}, (err, user) => {
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
    User.findOrCreate({ facebookId: profile.id, displayName: profile.displayName}, (err, user) => {
      return cb(err, user);
    });
  }
));

//middleware for every route
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

mongoose.connect("mongodb://localhost:27017/yelpDB", {useFindAndModify: false, useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
// seedDB(); //seed the database

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
