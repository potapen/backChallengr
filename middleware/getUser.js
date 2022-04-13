const User = require("../models/User.model");

module.exports = async (req, res, next) => {
  // checks if the user is logged in when trying to access a specific page
  const userDoc = await User.findOne({ email: req.payload.email });
  req.user = userDoc;
  next();
};
