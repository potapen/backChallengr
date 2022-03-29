const router = require("express").Router();

const Challenge = require("../models/Challenge.model");
const League = require("../models/League.model");
const User = require("../models/User.model");

router.get("/main", async (req, res, next) => {
  try {
    user = await User.findById(req.session.user._id);
    console.log(user);

    userLeagues = await League.find({
      members: req.session.user._id,
    }).select("_id");
    const leagueIdsArray = userLeagues.map((league) => league._id);
    console.log(leagueIdsArray);

    const statsPerLeague = [];

    for (let i = 0; i < leagueIdsArray.length; i++) {
      // Stats per League
      let leagueID = leagueIdsArray[i];
      let countPerLeague = await Challenge.aggregate([
        {
          $match: {
            league: leagueID,
          },
        },
        {
          $group: {
            _id: "$league",
            count: {
              $count: {},
            },
            totalStake: {
              $sum: "$stake",
            },
          },
        },
      ]);
      countPerLeague = countPerLeague[0];
      countPerLeague = await League.populate(countPerLeague, {
        path: "_id",
      });

      // Stats per User
      let countPerUser = await Challenge.aggregate([
        {
          $match: {
            $and: [
              {
                contenders: user._id,
              },
              { league: leagueID },
            ],
          },
        },
        {
          $unwind: {
            path: "$contenders",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: {
              contenders: "$contenders",
              league: "$league",
            },
            count: {
              $count: {},
            },
            totalStake: {
              $sum: "$stake",
            },
          },
        },
      ]);
      countPerUser = countPerUser[0];
      countPerUser = await League.populate(countPerUser, {
        path: "_id.league",
      });

      // Stats per Winner
      let countPerWinner = await Challenge.aggregate([
        {
          $match: {
            $and: [
              {
                winners: user._id,
              },
              { league: leagueID },
            ],
          },
        },
        {
          $unwind: {
            path: "$winners",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: {
              winners: "$winners",
              league: "$league",
            },
            count: {
              $count: {},
            },
            totalStake: {
              $sum: "$stake",
            },
          },
        },
      ]);
      countPerWinner = countPerWinner[0];
      countPerWinner = await League.populate(countPerWinner, {
        path: "_id.league",
      });

      statsPerLeague.push({ countPerLeague, countPerUser, countPerWinner });
    }

    console.log(statsPerLeague);
    res.render("boards/main", { statsPerLeague });
  } catch (error) {
    console.log(error);
    next();
  }
});

module.exports = router;
