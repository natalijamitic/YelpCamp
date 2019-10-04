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

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.render("campgrounds/edit", {campground: foundCampground});
    }
  });
});
// UPDATE CAMPGROUND ROUTE
router.put("/:id", (req, res) => {
  // find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
  //redirect somewhere
});

//middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
