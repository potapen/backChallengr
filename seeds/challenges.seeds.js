// ℹ️ package responsible to make the connection with mongodb
// https://www.npmjs.com/package/mongoose
const mongoose = require("mongoose");
const User = require("../models/User.model");
const League = require("../models/League.model");
const Game = require("../models/Game.model");
const Challenge = require("../models/Challenge.model");
const Comment = require("../models/Comment.model");

// ℹ️ Sets the MongoDB URI for our app to have access to it.
// If no env has been set, we dynamically set it to whatever the folder name was upon the creation of the app

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/challengr";

const users = [
  {
    username: "alexandre",
    email: "alexandre@gmail.com",
    password: "$2b$10$HaYr5pczWlGBayK1XxoYpuJoarEHbmmc3S6/k.T5/JtR8Jh2Fsh3W", // hashed : password
    pictureUrl:
      "https://www.pngkit.com/png/full/336-3369016_attaque-des-titans-png-attack-on-titan-kapten.png",
  },
  {
    username: "ahn",
    email: "ahn@gmail.com",
    password: "$2b$10$HaYr5pczWlGBayK1XxoYpuJoarEHbmmc3S6/k.T5/JtR8Jh2Fsh3W", // hashed : password
    pictureUrl:
      "https://i.skyrock.net/6045/101456045/pics/3303167034_1_2_Ak7g2fQD.png",
  },
  {
    username: "brian",
    email: "brian@gmail.com",
    password: "$2b$10$HaYr5pczWlGBayK1XxoYpuJoarEHbmmc3S6/k.T5/JtR8Jh2Fsh3W", // hashed : password
    pictureUrl:
      "https://nintendolesite.com/images/tests/l_attaque_des_titan_2-0-28gkuhpsjn.png",
  },
];

const leagues = [
  {
    name: "Clash of titans",
    members: [],
    description: "Long live Eldians !",
    inviteKey: "1234",
  },
  {
    name: "Clash of clans",
    members: [],
    description: "Only one will survive !",
    inviteKey: "4567",
  },
];

const games = [
  {
    name: "Beer pong",
    description: "Le jeu du beerpong, classique",
    isPrivate: false,
    emoji: "🍻",
  },
  {
    name: "Torse pong",
    description: "Utilise ton torse pour mettre la balle dans le gobelet",
    isPrivate: true,
    ownerLeagues: [],
    emoji: "🫁",
  },
];

const challenges = [
  {
    contenders: [],
    winners: [],
    stake: 40,
    isCompleted: true,
  },
  {
    contenders: [],
    winners: [],
    stake: 30,
    isCompleted: true,
  },
  {
    contenders: [],
    winners: [],
    stake: 20,
    isCompleted: true,
  },
  {
    contenders: [],
    winners: [],
    stake: 15,
    isCompleted: true,
  },
  {
    contenders: [],
    winners: [],
    stake: 22,
    isCompleted: false,
  },
  {
    contenders: [],
    winners: [],
    stake: 30,
    isCompleted: false,
  },
];

const comments = [
  {
    content: "Awesome ! I'll never lose at this game !",
    rating: 5,
  },
  {
    content: "Damned ! I suck at beerpong !",
    rating: 2,
  },
  {
    content: "Oh yeah ! This game was intense",
    rating: 4,
  },
  {
    content: "Let's do this again soon",
    rating: 5,
  },
];

async function connectToDB() {
  return mongoose.connect(MONGO_URI).then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  });
}

async function seedDB() {
  await connectToDB();

  // Empty DB
  await User.deleteMany();
  console.log("Users deleted");
  await League.deleteMany();
  console.log("Leagues deleted");
  await Game.deleteMany();
  console.log("Games deleted");
  await Challenge.deleteMany();
  console.log("Challenges deleted");
  await Comment.deleteMany();
  console.log("Comments deleted");

  // Seed Users
  const usersDoc = await User.insertMany(users);
  console.log("Users created");

  // Seed Leagues
  leagues[0].members.push(usersDoc[0]._id);
  leagues[0].members.push(usersDoc[1]._id);
  leagues[0].members.push(usersDoc[2]._id);
  leagues[1].members.push(usersDoc[0]._id);
  leagues[1].members.push(usersDoc[1]._id);
  const leaguesDocs = await League.insertMany(leagues);
  console.log("Leagues inserted");

  // Seed Games
  games[1].ownerLeagues.push(leaguesDocs[1]._id);
  const GamesDoc = await Game.insertMany(games);
  console.log("Games inserted");

  // Seed Challenges
  challenges[0].contenders.push(usersDoc[0]._id);
  challenges[0].contenders.push(usersDoc[1]._id);
  challenges[0].contenders.push(usersDoc[2]._id);
  challenges[0].league = leaguesDocs[0]._id;
  challenges[0].game = GamesDoc[0]._id;
  challenges[0].winners.push(usersDoc[0]._id);

  challenges[1].contenders.push(usersDoc[0]._id);
  challenges[1].contenders.push(usersDoc[1]._id);
  challenges[1].league = leaguesDocs[1]._id;
  challenges[1].game = GamesDoc[1]._id;
  challenges[1].winners.push(usersDoc[0]._id);

  challenges[2].contenders.push(usersDoc[0]._id);
  challenges[2].contenders.push(usersDoc[1]._id);
  challenges[2].contenders.push(usersDoc[2]._id);
  challenges[2].league = leaguesDocs[0]._id;
  challenges[2].game = GamesDoc[0]._id;
  challenges[2].winners.push(usersDoc[0]._id);

  challenges[3].contenders.push(usersDoc[0]._id);
  challenges[3].contenders.push(usersDoc[1]._id);
  challenges[3].league = leaguesDocs[1]._id;
  challenges[3].game = GamesDoc[1]._id;
  challenges[3].winners.push(usersDoc[0]._id);

  challenges[4].contenders.push(usersDoc[0]._id);
  challenges[4].contenders.push(usersDoc[1]._id);
  challenges[4].contenders.push(usersDoc[2]._id);
  challenges[4].league = leaguesDocs[0]._id;
  challenges[4].game = GamesDoc[0]._id;

  challenges[5].contenders.push(usersDoc[0]._id);
  challenges[5].contenders.push(usersDoc[1]._id);
  challenges[5].league = leaguesDocs[1]._id;
  challenges[5].game = GamesDoc[1]._id;

  challengesDocs = await Challenge.insertMany(challenges);
  console.log("Challenges inserted");

  // Seed Comments
  comments[0].user = usersDoc[0]._id;
  comments[0].challenge = challengesDocs[0]._id;

  comments[1].user = usersDoc[1]._id;
  comments[1].challenge = challengesDocs[0]._id;

  comments[2].user = usersDoc[0]._id;
  comments[2].challenge = challengesDocs[1]._id;

  comments[3].user = usersDoc[0]._id;
  comments[3].challenge = challengesDocs[2]._id;
  await Comment.insertMany(comments);
  console.log("Comments inserted");

  await mongoose.disconnect();
  console.log("DB disconnected");
}

seedDB();
