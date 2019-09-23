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
router.post("/", (req, res) => {
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
router.get("/new", (req, res) => {
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

module.exports = router;
