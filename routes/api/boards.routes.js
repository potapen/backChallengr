const router = require("express").Router();

const {
  getCountPerLeague,
  getCountPerUser,
  getCountPerWinner,
  getFullRankingPerLeague,
} = require("../../db/helpers/statsQueries");

const getUser = require("../../middleware/getUser");
const getUserLeagues = require("../../middleware/getUserLeagues");

router.get(
  "/profile/:profileId",
  getUser,
  getUserLeagues,
  async (req, res, next) => {
    try {
      const profileId = req.params.profileId;
      const userLeaguesIds = req.userLeaguesIds;
      const statsPerLeague = [];

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
      next(error);
    }
  }
);

module.exports = router;
