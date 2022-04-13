const router = require("express").Router();
const Challenge = require("../../models/Challenge.model");
const Game = require("../../models/Game.model");
const League = require("../../models/League.model");
const User = require("../../models/User.model");
const mongoose = require("mongoose");
const isLoggedIn = require("../../middleware/isLoggedIn");
const getUser = require('../../middleware/getUser')
/* GET home page */


/*
----------------------------------------------------------------------------------------------------------------
-----  GET
----------------------------------------------------------------------------------------------------------------
*/

router.get("/",getUser, async (req, res, next) => {
  try {
    //if there a league in the query, we can show all the challenges of that league
    const { leagueId } = req.query;
    if (leagueId) {
      const league = await League.findById(leagueId)
      
      console.log("league.members", league.members)
      console.log("req.user._id", req.user._id)
      let challenges = []
      if (league.members.includes(req.user._id)) {
        challenges = await Challenge.find({ league })
          .sort({ createdAt: -1 })
          .populate("league game contenders winners");
      }
      
      const data = {
        challenges,
      };
      // res.render("challenge/list", data);
      res.json(data);
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
    console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee get /list");
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
  try {
    const { league, game, contenders } = req.body;
    const challengeToCreate = { 
      league,
      game,
      contenders,
      isCompleted:false
    };
    const challengeCreated = await Challenge.create(challengeToCreate);
    // res.redirect("/");
    res.json(challengeCreated)
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
----------------------------------------------------------------------------------------------------------------
-----  PUT/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.put("/:challengeId", async (req, res, next) => {
  try {
    const {
      id,
      contenders,
      league,
      game,
      winners,
      isCompleted,
    } = req.body;
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
    // res.send(challengeUpdated);
    // res.redirect("/");
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


/*
----------------------------------------------------------------------------------------------------------------
-----  ONGOING
----------------------------------------------------------------------------------------------------------------
*/
router.get("/ongoing", async (req, res, next) => {
  try {
    challenges = await Challenge.find({ contenders: req.user,isCompleted:false})
    .sort({ createdAt: -1 })
    .populate("league game contenders winners");

    res.json();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
