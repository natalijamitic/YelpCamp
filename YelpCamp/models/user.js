const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const UserSchema = new mongoose.Schema({
  displayName: String,
  email: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  googleId: String,
  facebookId: String
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", UserSchema);
