const League = require("../models/League.model");

module.exports = async (req, res, next) => {
  // return the Leagues the User is part of
  const userLeagues = await League.find({
    members: req.user._id,
  });
  const userLeaguesIds = userLeagues.map((league) => league._id);
  req.userLeagues = userLeagues;
  req.userLeaguesIds = userLeaguesIds;
  next();
};
