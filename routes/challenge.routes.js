const router = require("express").Router();
const Challenge = require("../models/Challenge.model");
const Game = require("../models/Game.model");
const League = require("../models/League.model");
const User = require("../models/User.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.send("challenge!");
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
  const challengeToCreate = req.body
  const challengeCreated = await Challenge.create(challengeToCreate)
  res.send("create post")
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