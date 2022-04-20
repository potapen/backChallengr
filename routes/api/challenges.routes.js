const router = require("express").Router();
const Challenge = require("../../models/Challenge.model");
const Game = require("../../models/Game.model");
const League = require("../../models/League.model");
const User = require("../../models/User.model");
const mongoose = require("mongoose");
const isLoggedIn = require("../../middleware/isLoggedIn");
const getUser = require("../../middleware/getUser");
/* GET home page */

/*
----------------------------------------------------------------------------------------------------------------
-----  GET all challenges
for all leagues: http://localhost:5005/api/challenges/?leagueId=6257d7a7e8b2c54dbd502d19
for a specific league : http://localhost:5005/api/challenges
----------------------------------------------------------------------------------------------------------------
*/

router.get("/", getUser, async (req, res, next) => {
  try {
    //if there a league in the query, we can show all the challenges of that league
    const { leagueId } = req.query;
    if (leagueId) {
      const league = await League.findById(leagueId);
      let challenges = [];
      if (league.members.includes(req.user._id)) {
        //we check that the user is part of the league
        challenges = await Challenge.find({ league })
          .sort({ createdAt: -1 })
          .populate("league game contenders winners");
        const data = {
          challenges,
        };
        res.json(data);
      } else {
        res
          .status(401)
          .send("unauthorized, you are not part of the league requested");
      }
    } else {
      const leagues = await League.find({
        members: req.user._id,
      });
      const challenges = await Challenge.find({ leagues })
        .sort({ createdAt: -1 })
        .populate("league game contenders winners");
      const data = {
        challenges,
      };
      // res.render("challenge/list", data);
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
----------------------------------------------------------------------------------------------------------------
-----  ONGOING
----------------------------------------------------------------------------------------------------------------
*/
router.get("/ongoing", getUser, async (req, res, next) => {
  try {
    challenges = await Challenge.find({
      contenders: req.user._id,
      isCompleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("league game contenders winners");

    res.json({ challenges });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
----------------------------------------------------------------------------------------------------------------
-----  GET a single challenge from its id
http://localhost:5005/api/challenges/6257d7a7e8b2c54dbd502d30
----------------------------------------------------------------------------------------------------------------
*/

router.get("/:challengeId", getUser, async (req, res, next) => {
  try {
    //if there a league in the query, we can show all the challenges of that league
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    console.log("challenge", challenge);

    if (challenge.contenders.includes(req.user._id)) {
      //we check that the user is part of the challenge
      //we populate afterwards to prevent breaking the check if the if
      await challenge.populate("league game contenders winners");
      const data = {
        challenge,
      };
      res.json(data);
    } else {
      res
        .status(401)
        .send("unauthorized, you are not part of the challenge requested");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});
/*
----------------------------------------------------------------------------------------------------------------
-----  POST
----------------------------------------------------------------------------------------------------------------
*/

router.post("/", async (req, res, next) => {
  console.log("inside post to create");
  try {
    const { league, game, contenders } = req.body;
    const challengeToCreate = {
      league,
      game,
      contenders,
      isCompleted: false,
    };
    console.log("challengeToCreate", challengeToCreate);
    const challengeCreated = await Challenge.create(challengeToCreate);
    // res.redirect("/");
    res.json(challengeCreated);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
----------------------------------------------------------------------------------------------------------------
-----  PATCH/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.patch("/:challengeId", getUser, async (req, res, next) => {
  try {
    const { id, contenders, league, game, winners, isCompleted } = req.body;
    const challengeToEdit = {
      contenders,
      league,
      game,
      winners,
      isCompleted: Boolean(isCompleted),
    };
    const challengeUpdated = await Challenge.findByIdAndUpdate(
      id,
      challengeToEdit,
      { new: true }
    );
    res.json(challengeUpdated);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
----------------------------------------------------------------------------------------------------------------
-----  DELETE/:challengeID
----------------------------------------------------------------------------------------------------------------
*/

router.delete("/:challengeId", async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const challengeDeleted = await Challenge.findByIdAndDelete(challengeId);
    // res.redirect("/");
    res.json(challengeDeleted);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
