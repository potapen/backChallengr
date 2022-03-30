const router = require("express").Router();

const Challenge = require("../models/Challenge.model");
const League = require("../models/League.model");
const User = require("../models/User.model");

const isLoggedIn = require("../middleware/isLoggedIn");
const { redirect } = require("express/lib/response");

router.get("/main", isLoggedIn, async (req, res, next) => {
  try {
    res.redirect(`/boards/${req.session.user._id}`);
  } catch {
    next();
  }
});

router.get("/:id", isLoggedIn, async (req, res, next) => {
  try {
    let id = req.params.id;
    user = await User.findById(id);

    userLeagues = await League.find({
      members: req.session.user._id,
    }).select("_id");
    const leagueIdsArray = userLeagues.map((league) => league._id);

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
            $and: [{ league: leagueID }],
          },
        },
        {
          $unwind: {
            path: "$contenders",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            contenders: user._id,
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
            $and: [{ league: leagueID }],
          },
        },
        {
          $unwind: {
            path: "$winners",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            $and: [
              {
                winners: user._id,
              },
            ],
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

      // Ranking
      let rankingPerLeague = await Challenge.aggregate([
        {
          $match: {
            $and: [{ league: leagueID }],
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
        {
          $sort: {
            totalStake: -1,
          },
        },
      ]);
      rankingPerLeague = await League.populate(rankingPerLeague, {
        path: "_id.league",
      });
      rankingPerLeague = await User.populate(rankingPerLeague, {
        path: "_id.winners",
      });
      const winnersArray = rankingPerLeague.map((user) => user._id.winners._id);
      const league = await League.findById(leagueID);
      const membersArray = league.members.map((member) => member._id);

      const noWinners = await User.find({
        $and: [
          {
            _id: {
              $in: membersArray,
            },
          },
          {
            _id: {
              $nin: winnersArray,
            },
          },
        ],
      });

      statsPerLeague.push({
        countPerLeague,
        countPerUser,
        countPerWinner,
        rankingPerLeague,
        noWinners,
      });
    }

    res.render("boards/main", { user, statsPerLeague });
  } catch (error) {
    console.log(error);
    next();
  }
});

module.exports = router;
