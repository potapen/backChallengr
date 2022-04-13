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
-----  LIST
http://localhost:3000/api/challenge/
returns a list of leagues.
or
http://localhost:3000/api/challenge/?league=62568ec9a6714fef61e70657
returns a list of challenges for a league.
----------------------------------------------------------------------------------------------------------------
*/

router.get("/",getUser, async (req, res, next) => {
  try {
    //if there a league in the query, we can show all the challenges of that league
    const { leagueID } = req.query;
    if (leagueID) {
      const league = await League.findById(leagueID)
      
      console.log("league.members", league.members)
      console.log("req.user._id", req.user._id)
      const challenges = await Challenge.find({ league })
        .sort({ createdAt: -1 })
        .populate("league game contenders winners");

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
-----  CREATE
http://localhost:3000/api/challenge/create
returns
  leagues

http://localhost:3000/api/challenge/create?league=62568ec9a6714fef61e70657
returns
  games,
  users,
  league (the link in the param)
----------------------------------------------------------------------------------------------------------------
*/
router.get("/create", getUser, async (req, res, next) => {//to be deleted?
  try {
    //if there a league in the query, we can show the right options for that league
    console.log("req.query: ", req.query);
    const { league } = req.query;
    if (league) {
      const games = await Game.find({
        $or: [{ ownerLeagues: league }, { isPrivate: false }],
      });
      const users = await User.find();
      const data = {
        games,
        users,
        league,
      };
      // res.render("challenge/createWithLeagueID", data);
      res.json(data);
    } else {
      //show a page to click on a league first. Once the user selects a league, there is a get with league in the query
      const leagues = await League.find({
        members: req.user._id,
      });
      const data = {
        leagues,
      };
      res.json(data);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { league, game, contenders } = req.body;
    const challengeToCreate = { league, game, contenders };
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
-----  EDIT/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.put("/:id", async (req, res, next) => {
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

router.get("/edit/:id", getUser,async (req, res, next) => {//to be deleted?
  try {
    const { id } = req.params;
    const challengeToEdit = await Challenge.findById(id)
      .populate("contenders")
      .populate("league")
      .populate("game")
      .populate("winners")
      .populate("isCompleted");

    const usersContender = await User.find(); //pas besoin de .lean()...c'est magigue...
    usersContender.forEach((person1) => {
      const isSelected = challengeToEdit.contenders.some((person2) => {
        const isSame =
          JSON.stringify(person1._id) === JSON.stringify(person2._id);
        return isSame;
      });
      person1.selected = isSelected;
    });

    const usersWinner = await User.find(); //pas besoin de .lean()...c'est magigue...
    usersWinner.forEach((person1) => {
      const isSelected = challengeToEdit.winners.some((person2) => {
        const isSame =
          JSON.stringify(person1._id) === JSON.stringify(person2._id);
        return isSame;
      });
      person1.selected = isSelected;
    });

    const leagues = await League.find({
      members: req.user._id,
    }); //pas besoin de .lean()...c'est magigue...

    leagues.forEach((league1) => {
      league2 = challengeToEdit.league;
      const isSame =
        JSON.stringify(league1._id) === JSON.stringify(league2._id);
      if (isSame) {
        league1.selected = true;
      }
    });

    const userLeagues = await League.find({
      members: req.user._id,
    }).select("_id");
    leagueIdsArray = userLeagues.map((league) => league._id);

    const games = await Game.find({
      $or: [{ isPrivate: false }, { ownerLeagues: { $in: leagueIdsArray } }],
    }).lean(); //.lean() permet de modifier l'objet retourne sans avoir à MaJ le schema
    games.forEach((game1) => {
      game2 = challengeToEdit.game;
      const isSame = JSON.stringify(game1._id) === JSON.stringify(game2._id);
      if (isSame) {
        game1.selected = true;
      }
    });

    const data = {
      usersContender,
      usersWinner,
      leagues,
      games,
      challenge: challengeToEdit,
    };
    res.json(data);
  } catch (error) {
    console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee get /edit/:challengeID");
    console.error(error);
    next(error);
  }
});
/*
----------------------------------------------------------------------------------------------------------------
-----  UPDATE/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.get("/update/:id", async (req, res, next) => {//to be deleted?
  try {
    const { id } = req.params;
    const challengeToEdit = await Challenge.findById(id)
      .populate("contenders")
      .populate("league")
      .populate("game")
      .populate("winners")
      .populate("isCompleted");

    const contenders = challengeToEdit.contenders;

    const data = {
      contenders,
      challenge: challengeToEdit,
    };
    // res.render("challenge/update", data);
    res.json(data);
  } catch (error) {
    console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee get /edit/:challengeID");
    console.error(error);
    next(error);
  }
});
/*
----------------------------------------------------------------------------------------------------------------
-----  DELETE/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.get("/delete/:id", async (req, res, next) => { //to be deleted?
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);
    data = { challenge };
    // res.render("challenge/delete", data);
    res.json(data);
  } catch (error) {
    console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee get /delete/:id");
    console.error(error);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.body;
    const challengeDeleted = await Challenge.findByIdAndDelete(id);
    // res.redirect("/");
    res.json(challengeDeleted);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
