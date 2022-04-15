const router = require("express").Router();
const Challenge = require("../../models/Challenge.model");
const Game = require("../../models/Game.model");
const League = require("../../models/League.model");
const User = require("../../models/User.model");
const isLoggedIn = require("../../middleware/isLoggedIn");
const { redirect } = require("express/lib/response");
const mongoose = require("mongoose");
const isLeagueMember = require("../../middleware/isLeagueMember");
const getUser = require("../../middleware/getUser");
const getUserLeagues = require("../../middleware/getUserLeagues");

const {
  getCountPerLeague,
  getCountPerUser,
  getCountPerWinner,
  getFullRankingPerLeague,
} = require("../../db/helpers/statsQueries");

router.get("/", async (req, res, next) => {
  res.send("stats home");
});

//return an list of object, each object being the sum stake for a given timestamp (for one league)
/*
[
    {
        "_id": "04-14T08:13",
        "totalPoints": 10
    },
    {
        "_id": "04-14T08:13",
        "totalPoints": 30
    }
]
*/
router.get(
  "/lineChart/league/:leagueId",
  getUser,
  isLeagueMember,
  async (req, res, next) => {
    const { leagueId } = req.params;
    const leagueIDObject = mongoose.Types.ObjectId(leagueId);
    let pointsOverTime = await Challenge.aggregate([
      {
        $match: {
          league: leagueIDObject,
          isCompleted: true,
        },
      },
      {
        $group: {
          _id: "$createdAt", //groups documents by the same ID $createdAt, the grouping will have ID $createdAt
          totalPoints: {
            $sum: "$points", //sum the points for a given grouping
          },
        },
      },
      {
        $sort: {
          _id: 1, //sort by _id
        },
      },
    ]);
    //shorten the dates string
    pointsOverTime.forEach((obj) => {
      let monString = JSON.stringify(obj._id);
      monString = monString.substring(6, 17);
      obj._id = monString;
    });
    res.json(pointsOverTime);
  }
);

//returns a list of object, each object being the sum stake and count for a given game name (for one user in a specific league)
//used for axios calls only

/*
[
    {
        "_id": "6257d7a7e8b2c54dbd502d22",
        "name": "Beer pong",
        "description": "Le jeu du beerpong, classique",
        "imageUrl": "https://www.jeux-alcool.com/wp-content/uploads/2017/03/beerPong.jpeg",
        "__v": 0,
        "createdAt": "2022-04-14T08:13:27.661Z",
        "updatedAt": "2022-04-14T08:13:27.661Z",
        "totalPoints": 10
    },
    {
        "_id": "6257d7a7e8b2c54dbd502d23",
        "name": "Torse pong",
        "description": "Utilise ton torse pour mettre la balle dans le gobelet",
        "imageUrl": "https://i0.wp.com/godrunkyourself.com/wp-content/uploads/2020/04/AdobeStock_137721763-1-1440x960.jpeg",
        "__v": 0,
        "createdAt": "2022-04-14T08:13:27.661Z",
        "updatedAt": "2022-04-14T08:13:27.661Z",
        "totalPoints": 0,
        "totalGames": 0
    }
]
*/

router.get(
  // "/radarChart/league/:leagueId/user/:userId",
  "/radarChart/league/:leagueId/user/:userId",
  async (req, res, next) => {
    try {
      let { leagueId, userId } = req.params;
      const userObjectID = mongoose.Types.ObjectId(userId);
      const leagueObjectID = mongoose.Types.ObjectId(leagueId);

      let pointsPerGame = await Challenge.aggregate([
        {
          $match: {
            //get all completed challenges for a league
            league: leagueObjectID,
            isCompleted: true,
          },
        },
        {
          $unwind: {
            //in case a document contains multiple winners, created a separate doc for each winner. It also adds an index
            path: "$winners",
            includeArrayIndex: "index",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            winners: userObjectID, //only keep the documents for a given user
          },
        },
        {
          $group: {
            _id: "$game", //group all documents corresponding to a game
            totalPoints: {
              $sum: "$points", //compute the sum of points
            },
            totalGames: {
              $count: {}, //count the number of docs
            },
          },
        },
      ]);

      // The documents look like this
      /*
        {
        _id:6257d7a7e8b2c54dbd502d22,
          totalPoints:30,
          totalGames:1
        }

      */
      //populate the documents with info from Game
      pointsPerGame = await Game.populate(pointsPerGame, {
        path: "_id",
      });

      //get list of all games. .lean() allows the objects to be modified
      allGames = await Game.find().lean();

      //populate the allGames list with info from pointsPerGame. For a matching game, we want to add the totalPoints and the totalGames
      allGames.forEach((game1) => {
        const correctGame2 = pointsPerGame.filter((game2) => {
          const sameGame =
            JSON.stringify(game1._id) === JSON.stringify(game2._id._id);
          return sameGame;
        });
        if (correctGame2[0]) {
          game1.totalPoints = correctGame2[0].totalPoints;
          game1.totalGames = correctGame2[0].totalGames;
        } else {
          game1.totalPoints = 0;
          game1.totalGames = 0;
        }
      });

      res.json(allGames);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get(
  "/profile/:profileId",
  getUser,
  getUserLeagues,
  async (req, res, next) => {
    try {
      const profileId = req.params.profileId;
      const userLeaguesIds = req.userLeaguesIds;
      const statsPerLeague = [];
      console.log("profileId",profileId)

      for (let i = 0; i < userLeaguesIds.length; i++) {
        const leagueId = userLeaguesIds[i];

        const countPerLeague = await getCountPerLeague(leagueId);
        const countPerUser = await getCountPerUser(leagueId, profileId);
        const countPerWinner = await getCountPerWinner(leagueId, profileId);
        const fullRankingPerLeague = await getFullRankingPerLeague(leagueId);

        statsPerLeague.push({
          countPerLeague,
          countPerUser,
          countPerWinner,
          fullRankingPerLeague,
        });
      }

      res.json({ statsPerLeague });
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

module.exports = router;
