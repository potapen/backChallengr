const League = require("../../models/League.model");
const User = require("../../models/User.model");
const Challenge = require("../../models/Challenge.model");

const getCountPerLeague = async (leagueId) => {
  let countPerLeague = await Challenge.aggregate([
    {
      $match: {
        league: leagueId,
      },
    },
    {
      $group: {
        _id: "$league",
        count: {
          $count: {},
        },
        totalPoints: {
          $sum: "$points",
        },
      },
    },
  ]);
  countPerLeague = countPerLeague[0];
  return countPerLeague;
};

const getCountPerUser = async (leagueId, profileId) => {
  const profile = await User.findById(profileId);
  console.log("profile", profile);

  let countPerUser = await Challenge.aggregate([
    {
      $match: {
        league: leagueId,
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
        contenders: profile._id,
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
        totalPoints: {
          $sum: "$points",
        },
      },
    },
  ]);
  countPerUser = countPerUser[0];
  return countPerUser;
};

const getCountPerWinner = async (leagueId, profileId) => {
  const profile = await User.findById(profileId);

  let countPerWinner = await Challenge.aggregate([
    {
      $match: {
        $and: [{ league: leagueId }],
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
            winners: profile._id,
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
        totalPoints: {
          $sum: "$points",
        },
      },
    },
  ]);
  countPerWinner = countPerWinner[0];
  return countPerWinner;
};

const getFullRankingPerLeague = async (leagueId) => {
  const fullRankingPerLeague = [];
  let rankingPerLeague = await Challenge.aggregate([
    {
      $match: {
        $and: [{ league: leagueId }],
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
        totalPoints: {
          $sum: "$points",
        },
      },
    },
    {
      $sort: {
        totalPoints: -1,
      },
    },
  ]);

  rankingPerLeague = await User.populate(rankingPerLeague, {
    path: "_id.winners",
    select: { _id: 1, username: 1, pictureUrl: 1 },
  });
  fullRankingPerLeague.push(rankingPerLeague);

  const winnersArray = rankingPerLeague.map((user) => user._id.winners._id);
  const league = await League.findById(leagueId);
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
  }).select({ _id: 1, username: 1, pictureUrl: 1 });
  fullRankingPerLeague.push(noWinners);
  return fullRankingPerLeague;
};

module.exports = {
  getCountPerLeague,
  getCountPerUser,
  getCountPerWinner,
  getFullRankingPerLeague,
};
