const router = require("express").Router();
const Challenge = require("../../models/Challenge.model");
const Game = require("../../models/Game.model");
const League = require("../../models/League.model");
const User = require("../../models/User.model");
const isLoggedIn = require("../../middleware/isLoggedIn");
const { redirect } = require("express/lib/response");
const mongoose = require("mongoose");

router.get("/", async (req, res, next) => {
  res.send('stats home')
});


//return an list of object, each object being the sum stake for a given timestamp (for one league)
//used for axios calls only
router.get("/league/:leagueId", isLoggedIn, async (req, res, next) => {
  const { leagueId } = req.params;
  const league = await League.findById(leagueId).populate("members");
  const leagueIDObject = mongoose.Types.ObjectId(leagueId);
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
        _id: 1,
      },
    },
  ]);
  const stakeOverTimeSimple = stakeOverTime.map((obj) => {
    let monString = JSON.stringify(obj._id);

    console.log(monString);
    monString = monString.substring(6, 17);
    console.log(monString);
    obj._id = monString;
  });
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
