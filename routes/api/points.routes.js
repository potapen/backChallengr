const router = require("express").Router();

const League = require("../../models/League.model");
const Challenge = require("../../models/Challenge.model");
const Point = require("../../models/Point.model");
const getUser = require("../../middleware/getUser");
const isLeagueMember = require("../../middleware/isLeagueMember");
const getParentLeague = require("../../middleware/getParentLeague");

// Returns the points by Id
router.get("/:pointId", async (req, res, next) => {
  try {
    const id = req.params.pointId;
    const point = await Point.findById(id).populate("game league");
    res.json({ point });
  } catch {
    next();
  }
});

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
router.patch(
  "/:pointId",
  getUser,
  getParentLeague,
  isLeagueMember,
  async (req, res, next) => {
    try {
      const id = req.params.pointId;
      let { points } = req.body;
      const updatedPoint = {
        points,
      };
      const updatedPointDoc = await Point.findByIdAndUpdate(id, updatedPoint, {
        new: true,
      });

      // Updated all points in related Challenges
      const updatedChallengesDoc = await Challenge.updateMany(
        {
          $and: [
            { league: updatedPointDoc.league },
            { game: updatedPointDoc.game },
          ],
        },
        { points: points },
        {
          new: true,
        }
      );

      res.status(201).json({ updatedPointDoc, updatedChallengesDoc });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
