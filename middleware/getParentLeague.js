const League = require("../models/League.model");
const Point = require("../models/Point.model");

module.exports = async (req, res, next) => {
  // return the league the point is linked to
  try {
    const id = req.params.pointId;
    try {
      const point = await Point.findById(id);
      console.log("found point", point);
      const league = await League.findById(point.league);
      console.log("found league", league);
      req.league = league;
      next();
    } catch {
      res.status(400).send("The challenge does not exist");
    }
  } catch (error) {
    next(error);
  }
};
