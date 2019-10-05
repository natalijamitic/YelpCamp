const express = require("express");
const router = express.Router();
const Campground = require("../models/campground")
const Comment = require("../models/comment")
const middleware = require("../middleware"); //if a dir is required "index.js" is automatically required

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
router.post("/", middleware.isLoggedIn, (req, res) => {
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
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// SHOW ROUTE
router.get("/:id", (req, res) => {
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err || !foundCampground) {
      req.flash("error", "Campground not found");
      res.redirect("back");
    } else {
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
      res.render("campgrounds/edit", {campground: foundCampground});
  });
});
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  // find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      req.flash("success", "Campground updated.")
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
  //redirect somewhere
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      Comment.deleteMany({_id: {$in: campgroundRemoved.comments}}, err => {
        if (err) {
          console.log(err);
        }
        req.flash("success", "Campground deleted.")
        res.redirect("/campgrounds");
      });
    }
  });
});


module.exports = router;
