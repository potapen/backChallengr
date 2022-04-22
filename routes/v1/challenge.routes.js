const router = require("express").Router();
const Challenge = require("../../models/Challenge.model");
const Game = require("../../models/Game.model");
const League = require("../../models/League.model");
const User = require("../../models/User.model");
const mongoose = require("mongoose");
const isLoggedIn = require("../../middleware/isLoggedIn");
/* GET home page */

router.get("/", (req, res, next) => {
  res.send("challenge");
});

/*
----------------------------------------------------------------------------------------------------------------
-----  LIST
----------------------------------------------------------------------------------------------------------------
*/
router.get("/list", isLoggedIn, async (req, res, next) => {
  try {
    //if there a league in the query, we can show all the challenges of that league
    const { league } = req.query;
    if (league) {
      const challenges = await Challenge.find({ league })
        .sort({ createdAt: -1 })
        .populate("league game contenders winners");

      const data = {
        challenges,
      };
      res.render("challenge/listWithLeagueID", data);
    } else {
      const leagues = await League.find({
        members: req.session.user._id,
      });
      const data = {
        leagues,
      };
      res.render("challenge/list", data);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

/*
----------------------------------------------------------------------------------------------------------------
-----  CREATE
----------------------------------------------------------------------------------------------------------------
*/
router.get("/create", isLoggedIn, async (req, res, next) => {
  try {
    //if there a league in the query, we can show the right options for that league
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
      res.render("challenge/createWithLeagueID", data);
    } else {
      //show a page to click on a league first. Once the user selects a league, there is a get with league in the query
      const leagues = await League.find({
        members: req.session.user._id,
      });
      const data = {
        leagues,
      };
      res.render("challenge/create", data);
    }
  } catch (error) {
    next();
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const { league, game, users, stake } = req.body;
    const challengeToCreate = { league, game, contenders: users, stake };
    const challengeCreated = await Challenge.create(challengeToCreate);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next();
  }
});

/*
----------------------------------------------------------------------------------------------------------------
-----  EDIT/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.post("/edit/:challengeID", async (req, res, next) => {
  try {
    const {
      challengeID,
      contenders,
      league,
      game,
      winners,
      stake,
      isCompleted,
    } = req.body;
    const challengeToEdit = {
      contenders,
      league,
      game,
      winners,
      stake,
      isCompleted: Boolean(isCompleted),
    };
    const challengeUpdated = await Challenge.findByIdAndUpdate(
      challengeID,
      challengeToEdit,
      { new: true }
    );
    // res.send(challengeUpdated);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next();
  }
});

router.get("/edit/:challengeID", async (req, res, next) => {
  try {
    const { challengeID } = req.params;
    const challengeToEdit = await Challenge.findById(challengeID)
      .populate("contenders")
      .populate("league")
      .populate("game")
      .populate("winners")
      .populate("stake")
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
      members: req.session.user._id,
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
      members: req.session.user._id,
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
    res.render("challenge/edit", data);
  } catch (error) {
    next(error);
  }
});
/*
----------------------------------------------------------------------------------------------------------------
-----  UPDATE/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.get("/update/:challengeID", async (req, res, next) => {
  try {
    const { challengeID } = req.params;
    const challengeToEdit = await Challenge.findById(challengeID)
      .populate("contenders")
      .populate("league")
      .populate("game")
      .populate("winners")
      .populate("stake")
      .populate("isCompleted");

    const contenders = challengeToEdit.contenders;

    const data = {
      contenders,
      challenge: challengeToEdit,
    };
    res.render("challenge/update", data);
  } catch (error) {
    next(error);
  }
});
/*
----------------------------------------------------------------------------------------------------------------
-----  EDIT/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.get("/delete/:challengeID", async (req, res, next) => {
  try {
    const { challengeID } = req.params;
    const challenge = await Challenge.findById(challengeID);
    data = { challenge };
    res.render("challenge/delete", data);
  } catch (error) {
    next(error);
  }
});

router.post("/delete/:challengeID", async (req, res, next) => {
  try {
    const { challengeID } = req.body;
    const challengeDeleted = await Challenge.findByIdAndDelete(challengeID);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next();
  }
});

module.exports = router;
