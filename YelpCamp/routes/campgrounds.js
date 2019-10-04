const express = require("express");
const router = express.Router();
const Campground = require("../models/campground")

// INDEX ROUTE
router.get("/", (req, res) => {
  Campground.find((err, foundCampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {campgrounds: foundCampgrounds});
    }
  });
});

// CREATE ROUTE
router.post("/", isLoggedIn, (req, res) => {
  const author = {
    id: req.user._id,
    displayName: req.user.displayName
  }
  const newCampground = new Campground({
    name: req.body.name,
    image: req.body.image,
    description: req.body.description,
    author: author
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
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// SHOW ROUTE
router.get("/:id", (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

//middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
