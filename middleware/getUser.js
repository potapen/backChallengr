const User = require("../models/User.model");

module.exports = async (req, res, next) => {
  // return the User document
  const userDoc = await User.findOne({ email: req.payload.email });
  req.user = userDoc;
  next();
};
