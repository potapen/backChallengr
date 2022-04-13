const League = require("../models/League.model");

module.exports = async (req, res, next) => {
  // checks if the user is a member of the league identified in the url
  // returns the league if so
  try {
    const id = req.params.leagueId || req.body.leagueId || req.league._id;
    try {
      const league = await League.findById(id);
      if (league.members.includes(req.user._id)) {
        req.league = league;
        next();
      } else {
        res.status(401).send("Not a member of the league");
      }
    } catch {
      res.status(400).send("The league does not exist");
    }
  } catch (error) {
    next(error);
  }
};
