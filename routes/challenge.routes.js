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

router.get("/list", async (req, res, next) => {
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
    const leagues = await League.find();
    const data = {
      leagues,
    }
    res.render("challenge/list", data);
  }
});

router.get("/create", async (req, res, next) => {
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
    const leagues = await League.find();
    const data = {
      leagues,
    }
    res.render("challenge/create", data);
  }
});

router.post("/create", async (req, res, next) => {
  console.log('req.body :', req.body)
  const {league, game, users, stake} = req.body
  const challengeToCreate = {league, game, contenders: users, stake}
  console.log('challengeToCreate: ', challengeToCreate)
  const challengeCreated = await Challenge.create(challengeToCreate)
  console.log('challengeCreated: ', challengeCreated)
  res.send("create post")
});

router.post("/edit/:challengeID", async (req, res, next) => {
  const {challengeID, contenders, league, game, winners,stake, isCompleted} = req.body
  const challengeToEdit = {
    contenders,
    league,
    game,
    winners,
    stake,
    isCompleted: Boolean(isCompleted)
  }
  // console.log('------------------------challengeToEdit:', challengeToEdit)
  console.log('------------------------challengeID: ', challengeID);
  // const challengeUpdated = Challenge.findById(mongoose.Types.ObjectId(challengeID))
  const challengeUpdated = await Challenge.findByIdAndUpdate(challengeID,challengeToEdit, {new: true});
  res.send(challengeUpdated);
});

router.get("/edit/:challengeID", async (req, res, next) => {
  const {challengeID} = req.params
  console.log('---------------------------challengeID: ', challengeID)
  const challengeToEdit = await Challenge.findById(challengeID)
  .populate('contenders')
  .populate('league')
  .populate('game')
  .populate('winners')
  .populate('stake')
  .populate('isCompleted')
  // console.log('---------------------------challengeToEdit: ',challengeToEdit)
  
  const usersContender = await User.find(); //pas besoin de .lean()...c'est magigue...
  usersContender.forEach(person1 => {
    const isSelected = challengeToEdit.contenders.some(person2 => {
        const isSame = JSON.stringify(person1._id) === JSON.stringify(person2._id)
        // console.log(`person1._id: ${JSON.stringify(person1._id)} person2._id: ${JSON.stringify(person2._id)} : ${isSame}`)
        return isSame
    })
    person1.selected = isSelected
  })
  
  const usersWinner = await User.find(); //pas besoin de .lean()...c'est magigue...
  usersWinner.forEach(person1 => {
    const isSelected = challengeToEdit.winners.some(person2 => {
        const isSame = JSON.stringify(person1._id) === JSON.stringify(person2._id)
        // console.log(`person1._id: ${JSON.stringify(person1._id)} person2._id: ${JSON.stringify(person2._id)} : ${isSame}`)
        return isSame
    })
    person1.selected = isSelected
  })

  const leagues = await League.find(); //pas besoin de .lean()...c'est magigue...

  leagues.forEach(league1 => {
    league2 = challengeToEdit.league
    const isSame = JSON.stringify(league1._id) === JSON.stringify(league2._id)
    //console.log(`league1._id: ${JSON.stringify(league1._id)} league2._id: ${JSON.stringify(league2._id)} : ${isSame}`)
    if(isSame){
      league1.selected = true;
    }
    });
  
  
  const games = await Game.find().lean(); //.lean() permet de modifier l'objet retourne sans avoir à MaJ le schema
  games.forEach(game1 => {
    game2 = challengeToEdit.game
    const isSame = JSON.stringify(game1._id) === JSON.stringify(game2._id)
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
  console.log('-----------------------------------------data: ', data)
  res.render('challenge/edit',data);
});


router.get("/delete/:challengeID", async (req, res, next) => {
  const {challengeID} = req.params
  console.log('---------------------------challengeID: ', challengeID)
  const challenge = await Challenge.findById(challengeID)
  console.log('--------------------------------challenge:', challenge)
  data = {challenge};
  res.render('challenge/delete', data);
});

router.post("/delete/:challengeID", async (req, res, next) => {
  const {challengeID} = req.body
  console.log('---------------------------challengeID: ', challengeID)
  const challengeDeleted = await Challenge.findByIdAndDelete(challengeID)
  console.log('--------------------------------challengeDeleted:', challengeDeleted)
  res.send(challengeDeleted);
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