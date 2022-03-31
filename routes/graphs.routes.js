const router = require("express").Router();
const Challenge = require("../models/Challenge.model");
const Game = require("../models/Game.model");
const League = require("../models/League.model");
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const { redirect } = require("express/lib/response");
const mongoose = require("mongoose");

router.get("/", isLoggedIn, async (req, res, next) => {
  const leagues = await League.find({
    members: req.session.user._id,
  });
  console.log('---------------------leagues', leagues)
  res.render("graphs/graph", { leagues });
});

//return the league object, populated with members (for one league).
//used for axios calls only
router.get("/leagueobj/:InputLeagueID", isLoggedIn, async (req, res, next) => {
  const { InputLeagueID } = req.params;
  const league = await League.findById(InputLeagueID).populate("members");
  res.send(league);
});

//return an list of object, each object being the sum stake for a given timestamp (for one league)
//used for axios calls only
router.get("/leaguestat/:InputLeagueID", isLoggedIn, async (req, res, next) => {
  const { InputLeagueID } = req.params;
  const league = await League.findById(InputLeagueID).populate("members");
  const leagueIDObject = mongoose.Types.ObjectId(InputLeagueID);
  let stakeOverTime = await Challenge.aggregate([
    {
      $match: {
        league: leagueIDObject,
      },
    },
    {
      $group: {
        _id: "$createdAt",
        totalStake: {
          $sum: "$stake",
        },
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
  ]);
  res.send(stakeOverTime);
});

//returns a list of object, each object being the sum stake and count for a given game name (for one user in a specific league)
//used for axios calls only
router.get(
  "/userstat/:InputLeagueID/:InputUserID",
  isLoggedIn,
  async (req, res, next) => {
    try {
      let { InputLeagueID, InputUserID } = req.params;
      const userObjectID = mongoose.Types.ObjectId(InputUserID);
      const leagueObjectID = mongoose.Types.ObjectId(InputLeagueID);

      let stakePerGame = await Challenge.aggregate([
        {
          $match: {
            league: leagueObjectID,
          },
        },
        {
          $unwind: {
            path: "$winners",
            includeArrayIndex: "index",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            winners: userObjectID,
          },
        },
        {
          $group: {
            _id: "$game",
            totalStake: {
              $sum: "$stake",
            },
            totalGame: {
              $count: {},
            },
          },
        },
      ]);

      stakePerGame = await Game.populate(stakePerGame, {
        path: "_id",
      });

      allGames = await Game.find().lean();
      allGames.forEach((game1) => {
        const correctGame2 = stakePerGame.filter((game2) => {
          const sameGame =
            JSON.stringify(game1._id) === JSON.stringify(game2._id._id);
          return sameGame;
        });
        if (correctGame2[0]) {
          game1.totalStake = correctGame2[0].totalStake;
          game1.totalGame = correctGame2[0].totalGame;
        } else {
          game1.totalStake = 0;
          game1.totalGame = 0;
        }
      });

      res.send(allGames);
    } catch (error) {
      console.log(error);
      next();
    }
  }
);
module.exports = router;
