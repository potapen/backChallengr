const router = require("express").Router();
const Challenge = require("../models/Challenge.model");
const Game = require("../models/Game.model");
const League = require("../models/League.model");
const User = require("../models/User.model");
const mongoose = require("mongoose");

/* GET home page */

router.get("/", (req, res, next) => {
  res.send('challenge');
});

/*
----------------------------------------------------------------------------------------------------------------
-----  LIST
----------------------------------------------------------------------------------------------------------------
*/
router.get("/list", async (req, res, next) => {
  try{
    //if there a league in the query, we can show all the challenges of that league
    console.log('---------------------------------------- req.query: ', req.query);
    const {league} = req.query;
    if(league){
      const challenges = await Challenge.find(
        {league}
      ).populate('league')
      .populate('game')
      .populate('contenders')
  
      const data = {
        challenges,
      };
      console.log('---------------------------------------- data: ', data);
      res.render("challenge/listWithLeagueID", data);
    }
    else{
      //show a page to click on a league first. Once the user selects a league, there is a get with league in the query
      //ex: http://localhost:3000/challenge/list?league=6242e8b08c623fa3f3698e12
      const leagues = await League.find({
        members: req.session.user._id,
      });
      const data = {
        leagues,
      }
      res.render("challenge/list", data);
    }
  }
  catch(error){
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee get /list');
    console.error(error);
    next();
  }

});

/*
----------------------------------------------------------------------------------------------------------------
-----  CREATE
----------------------------------------------------------------------------------------------------------------
*/
router.get("/create", async (req, res, next) => {
  try{
    //if there a league in the query, we can show the right options for that league
    console.log('req.query: ', req.query)
    const {league} = req.query
    if(league){
      const games = await Game.find(
        {ownerLeagues: league}
      );
      const users = await User.find();
      const data = {
        games,
        users,
        league,
      }
      res.render("challenge/createWithLeagueID", data);
    }
    else{
      //show a page to click on a league first. Once the user selects a league, there is a get with league in the query
      const leagues = await League.find({
        members: req.session.user._id,
      });
      const data = {
        leagues,
      }
      res.render("challenge/create", data);
    }
  }
  catch(error){
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee get /create');
    console.error(error);
  }

});

router.post("/create", async (req, res, next) => {
  try{
    console.log('req.body :', req.body);
    const {league, game, users, stake} = req.body;
    const challengeToCreate = {league, game, contenders: users, stake};
    console.log('challengeToCreate: ', challengeToCreate);
    const challengeCreated = await Challenge.create(challengeToCreate);
    console.log('challengeCreated: ', challengeCreated);
    res.render('challenge/done');
  }
  catch(error){
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee post /create');
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
  try{
    const {challengeID, contenders, league, game, winners,stake, isCompleted} = req.body;
    const challengeToEdit = {
      contenders,
      league,
      game,
      winners,
      stake,
      isCompleted: Boolean(isCompleted)
    }
    const challengeUpdated = await Challenge.findByIdAndUpdate(challengeID,challengeToEdit, {new: true});
    // res.send(challengeUpdated);
    res.render('challenge/done');
  }
  catch(error){
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee post /edit/:challengeID');
    console.error(error);
    next();
  }
});

router.get("/edit/:challengeID", async (req, res, next) => {
  try{
    const {challengeID} = req.params;
    const challengeToEdit = await Challenge.findById(challengeID)
    .populate('contenders')
    .populate('league')
    .populate('game')
    .populate('winners')
    .populate('stake')
    .populate('isCompleted');
    // console.log('---------------------------challengeToEdit: ',challengeToEdit)
    
    const usersContender = await User.find(); //pas besoin de .lean()...c'est magigue...
    usersContender.forEach(person1 => {
      const isSelected = challengeToEdit.contenders.some(person2 => {
          const isSame = JSON.stringify(person1._id) === JSON.stringify(person2._id);
          // console.log(`person1._id: ${JSON.stringify(person1._id)} person2._id: ${JSON.stringify(person2._id)} : ${isSame}`)
          return isSame;
      })
      person1.selected = isSelected;
    })
    
    const usersWinner = await User.find(); //pas besoin de .lean()...c'est magigue...
    usersWinner.forEach(person1 => {
      const isSelected = challengeToEdit.winners.some(person2 => {
          const isSame = JSON.stringify(person1._id) === JSON.stringify(person2._id);
          // console.log(`person1._id: ${JSON.stringify(person1._id)} person2._id: ${JSON.stringify(person2._id)} : ${isSame}`)
          return isSame;
      })
      person1.selected = isSelected;
    })
  
    const leagues = await League.find({
      members: req.session.user._id,
    }); //pas besoin de .lean()...c'est magigue...
  
    leagues.forEach(league1 => {
      league2 = challengeToEdit.league;
      const isSame = JSON.stringify(league1._id) === JSON.stringify(league2._id);
      //console.log(`league1._id: ${JSON.stringify(league1._id)} league2._id: ${JSON.stringify(league2._id)} : ${isSame}`)
      if(isSame){
        league1.selected = true;
      }
      });
    
    const userLeagues = await League.find({
      members: req.session.user._id,
    }).select("_id");
    console.log('------------------userLeagues: ', userLeagues);
    leagueIdsArray = userLeagues.map((league) => league._id);
    console.log('------------------leagueIdsArray: ', leagueIdsArray);

    const games = await Game.find({
      $or: [
        { isPrivate: false },
        // { ownerLeagues: { $elemMatch: { $in: leagueIdsArray } } },
        { ownerLeagues: { $in: leagueIdsArray } },
      ],
    }).lean(); //.lean() permet de modifier l'objet retourne sans avoir à MaJ le schema
    games.forEach(game1 => {
      game2 = challengeToEdit.game;
      const isSame = JSON.stringify(game1._id) === JSON.stringify(game2._id);
      //console.log(`league1._id: ${JSON.stringify(league1._id)} league2._id: ${JSON.stringify(league2._id)} : ${isSame}`)
      if(isSame){
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
    console.log('-----------------------------------------data: ', data);
    res.render('challenge/edit',data);
  }
  catch(error){
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee get /edit/:challengeID');
    console.error(error);
    next();
  }
});

/*
----------------------------------------------------------------------------------------------------------------
-----  EDIT/:challengeID
----------------------------------------------------------------------------------------------------------------
*/
router.get("/delete/:challengeID", async (req, res, next) => {
  try{
    const {challengeID} = req.params;
    console.log('---------------------------challengeID: ', challengeID);
    const challenge = await Challenge.findById(challengeID);
    console.log('--------------------------------challenge:', challenge);
    data = {challenge};
    res.render('challenge/delete', data);
  }
  catch(error){
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee get /delete/:challengeID');
    console.error(error);
    next();
  }
});

router.post("/delete/:challengeID", async (req, res, next) => {
  try{
    const {challengeID} = req.body;
    console.log('---------------------------challengeID: ', challengeID);
    const challengeDeleted = await Challenge.findByIdAndDelete(challengeID);
    console.log('--------------------------------challengeDeleted:', challengeDeleted);
    res.render('challenge/done');
  }
  catch(error){
    console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee post /delete/:challengeID');
    console.error(error);
    next();
  }

});

module.exports = router;


// const challengeSchema = new Schema(
//     {
//       contenders: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
//       leagues: [{ type: Schema.Types.ObjectId, ref: "League" }],
//       game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
//       winners: [{ type: Schema.Types.ObjectId, ref: "User" }],
//       stake: { type: Number, min: 0, required: true },
//       isCompleted: { type: Boolean },
//     },
//     {
//       // this second object adds extra properties: `createdAt` and `updatedAt`
//       timestamps: true,
//     }
//   );