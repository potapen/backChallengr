const router = require("express").Router();

const League = require("../../models/League.model");
const Game = require("../../models/Game.model");
const Point = require("../../models/Point.model");
const getUser = require("../../middleware/getUser");
const isLeagueMember = require("../../middleware/isLeagueMember");
const getParentLeague = require("../../middleware/getParentLeague");

// Returns the points for a league the logged user is part of
router.get(
  "/league/:leagueId",
  getUser,
  isLeagueMember,
  async (req, res, next) => {
    try {
      const points = await Point.find({
        league: req.league._id,
      }).populate("game");
      res.json({ points });
    } catch {
      next();
    }
  }
);

// Returns the points for the leagues the logged user is part of
router.get("/game/:gameId", getUser, async (req, res, next) => {
  try {
    userLeagues = await League.find({
      members: req.user._id,
    }).select("_id");
    leagueIdsArray = userLeagues.map((league) => league._id);

    const points = await Point.find({
      league: { $in: leagueIdsArray },
    }).populate("league");

    res.json({ points });
  } catch {
    next();
  }
});

// Edit a point, making sure the user is part of the league the point belongs to
router.put(
  "/:pointId",
  getUser,
  getParentLeague,
  isLeagueMember,
  async (req, res, next) => {
    try {
      const id = req.params.pointId;
      let { league, game, points } = req.body;
      const updatedPoint = {
        league,
        game,
        points,
      };
      const updatedPointDoc = await Point.findByIdAndUpdate(id, updatedPoint, {
        new: true,
      });

      res.status(201).json({ updatedPointDoc });
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

module.exports = router;
