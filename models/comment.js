const mongoose = require("mongoose");

const commentSchema = {
    text: String,
    author: String
};

module.exports = mongoose.model("Comment", commentSchema);
