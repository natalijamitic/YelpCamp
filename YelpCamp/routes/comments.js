const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");

//Comments New
router.get("/new", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground});
    }
  });
});

//Comments Create
router.post("/", isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(err);
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          if (req.user.displayName) {
            comment.author.displayName = req.user.displayName;
          }
          else {
            comment.author.displayName = req.body.comment.displayName;
          }
          //save comment
          comment.save();
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

// EDIT COMMENT ROUTE
router.get("/:comment_id/edit", (req, res) => {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
    }
  });
});
// UPDATE COMMENT ROUTE
router.put("/:comment_id", (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" +req.params.id);
    }
  });
  //redirect somewhere
});

// // DESTROY CAMPGROUND ROUTE
// router.delete("/:id", checkCampgroundOwnership, (req, res) => {
//   Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
//     if (err) {
//       res.redirect("/campgrounds");
//     } else {
//       Comment.deleteMany({_id: {$in: campgroundRemoved.comments}}, err => {
//         if (err) {
//           console.log(err);
//         }
//         res.redirect("/campgrounds");
//       });
//     }
//   });

//middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
