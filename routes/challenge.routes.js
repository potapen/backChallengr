const router = require("express").Router();
const Challenge = require("../models/Challenge.model");
const Game = require("../models/Game.model");
const League = require("../models/League.model");
const User = require("../models/User.model");

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
  console.log('---------------------------challengeToEdit: ',challengeToEdit)
  
  const users = await User.find();
  users.forEach(person1 => {
    // const isSelected = movie.cast.some(person2 => {
    //     const isSame = JSON.stringify(person1._id) === JSON.stringify(person2._id)
    //     console.log(`person1._id: ${JSON.stringify(person1._id)} person2._id: ${JSON.stringify(person2._id)} : ${isSame}`)
    //     return isSame
    // })
    // person1.selected = isSelected
  })

  const leagues = await League.find();
  const games = await Game.find();
  const data = {
    users,
    leagues,
    games,
    challenge: challengeToEdit,
  }
  res.render('challenge/edit',data)
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