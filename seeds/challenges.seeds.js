// ℹ️ package responsible to make the connection with mongodb
// https://www.npmjs.com/package/mongoose
const mongoose = require("mongoose");
const User = require("../models/User.model");
const League = require("../models/League.model");
const Game = require("../models/Game.model");
const Challenge = require("../models/Challenge.model");
const Comment = require("../models/Comment.model");
const Point = require("../models/Point.model");

// ℹ️ Sets the MongoDB URI for our app to have access to it.
// If no env has been set, we dynamically set it to whatever the folder name was upon the creation of the app

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/challengr-v2";

const users = [
  {
    username: "alexandre",
    email: "alexandre@gmail.com",
    password: "$2b$10$HaYr5pczWlGBayK1XxoYpuJoarEHbmmc3S6/k.T5/JtR8Jh2Fsh3W", // hashed : password
    pictureUrl:
      "http://res.cloudinary.com/dwfrbljbo/image/upload/ar_1.0,c_thumb,g_face,w_0.6,z_0.7/r_max/co_black,e_outline/v1/challengr/kmynmzlrmkc5ifecqtvx",
  },
  {
    username: "anh",
    email: "anh@gmail.com",
    password: "$2b$10$HaYr5pczWlGBayK1XxoYpuJoarEHbmmc3S6/k.T5/JtR8Jh2Fsh3W", // hashed : password
    pictureUrl:
      "http://res.cloudinary.com/dwfrbljbo/image/upload/ar_1.0,c_thumb,g_face,w_0.6,z_0.7/r_max/co_black,e_outline/v1/challengr/fzfv6acsgpi2ab07byb8",
  },
  {
    username: "brian",
    email: "brian@gmail.com",
    password: "$2b$10$HaYr5pczWlGBayK1XxoYpuJoarEHbmmc3S6/k.T5/JtR8Jh2Fsh3W", // hashed : password
    pictureUrl:
      "http://res.cloudinary.com/dwfrbljbo/image/upload/ar_1.0,c_thumb,g_face,w_0.6,z_0.7/r_max/co_black,e_outline/v1/challengr/yv9jpxk7ltepsrd5pkdp",
  },
];

const leagues = [
  {
    name: "Clash of titans",
    members: [],
    description: "Long live Eldians !",
    inviteKey: "1234",
    imageUrl:
      "http://res.cloudinary.com/dwfrbljbo/image/upload/c_fill,g_faces,h_500,w_500/v1/challengr/sp9x47jts5sb8bgwwiky",
  },
  {
    name: "Clash of clans",
    members: [],
    description: "Only one will survive !",
    inviteKey: "1234",
    imageUrl:
      "http://res.cloudinary.com/dwfrbljbo/image/upload/c_fill,g_faces,h_500,w_500/v1/challengr/obvoe2bmigjhkhz9uipn",
  },
];

const games = [
  {
    name: "Beer pong",
    description: "Le jeu du beerpong, classique",
    imageUrl:
      "https://www.jeux-alcool.com/wp-content/uploads/2017/03/beerPong.jpeg",
  },
  {
    name: "Torse pong",
    description: "Utilise ton torse pour mettre la balle dans le gobelet",
    imageUrl:
      "https://i0.wp.com/godrunkyourself.com/wp-content/uploads/2020/04/AdobeStock_137721763-1-1440x960.jpeg",
  },
  {
    name: "Bird box challenge",
    description:
      "Ce défi est tiré du film Bird Box sorti le 21 décembre 201880. Il consiste, comme dans le film, à se déplacer les yeux bandés d'un point A à un point B",
    imageUrl:
      "https://d1fmx1rbmqrxrr.cloudfront.net/cnet/i/edit/2019/01/birdbox-netflix-big.jpg",
  },
  {
    name: "Rock Scissors Paper",
    description: "The classic one",
    imageUrl:
      "https://cdn-europe1.lanmedia.fr/var/europe1/storage/images/europe1/international/la-recette-pour-gagner-a-pierre-feuille-ciseaux-768904/15409112-1-fre-FR/La-recette-pour-gagner-a-pierre-feuille-ciseaux.jpg",
  },
];

const challenges = [
  {
    contenders: [],
    winners: [],
    isCompleted: true,
  },
  {
    contenders: [],
    winners: [],
    isCompleted: true,
  },
  {
    contenders: [],
    winners: [],
    isCompleted: true,
  },
  {
    contenders: [],
    winners: [],
    isCompleted: true,
  },
  {
    contenders: [],
    winners: [],
    isCompleted: false,
  },
  {
    contenders: [],
    winners: [],
    isCompleted: false,
  },
];

const comments = [
  {
    content: "Awesome ! I'll never lose at this game !",
  },
  {
    content: "Damned ! I suck at beerpong !",
  },
  {
    content: "Oh yeah ! This game was intense",
  },
  {
    content: "Let's do this again soon",
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
  await Point.deleteMany();
  console.log("Points deleted");

  // Seed Users
  const usersDoc = await User.insertMany(users);
  console.log("Users created");

  // Seed Leagues
  leagues[0].members.push(usersDoc[0]._id);
  leagues[0].members.push(usersDoc[1]._id);
  leagues[0].members.push(usersDoc[2]._id);
  leagues[1].members.push(usersDoc[0]._id);
  leagues[1].members.push(usersDoc[1]._id);
  let leaguesDocs = await League.insertMany(leagues);
  console.log("Leagues inserted");

  leaguesDocs = await League.find();
  leaguesDocs.forEach((league) => (league.inviteKey = league._id));
  await League.deleteMany();
  leaguesDocs = await League.insertMany(leaguesDocs);
  console.log("Leagues inserted with invite key");

  await User.updateOne(
    { _id: usersDoc[0]._id },
    { $set: { favoriteLeague: leaguesDocs[0]._id } }
  );
  await User.updateOne(
    { _id: usersDoc[1]._id },
    { $set: { favoriteLeague: leaguesDocs[1]._id } }
  );
  await User.updateOne(
    { _id: usersDoc[2]._id },
    { $set: { favoriteLeague: leaguesDocs[0]._id } }
  );
  console.log("Users updated with favorite league");

  // Seed Games
  const gamesDoc = await Game.insertMany(games);
  console.log("Games inserted");

  // Seed Point
  const points = [
    {
      game: gamesDoc[0]._id,
      league: leaguesDocs[0]._id,
    },
    {
      game: gamesDoc[0]._id,
      league: leaguesDocs[1]._id,
      points: 2,
    },
    {
      game: gamesDoc[1]._id,
      league: leaguesDocs[0]._id,
      points: 2,
    },
    {
      game: gamesDoc[1]._id,
      league: leaguesDocs[1]._id,
    },
    {
      game: gamesDoc[2]._id,
      league: leaguesDocs[0]._id,
    },
    {
      game: gamesDoc[2]._id,
      league: leaguesDocs[1]._id,
    },
    {
      game: gamesDoc[3]._id,
      league: leaguesDocs[0]._id,
    },
    {
      game: gamesDoc[3]._id,
      league: leaguesDocs[1]._id,
    },
  ];
  const pointsDoc = await Point.insertMany(points);
  console.log("Points inserted");

  // Seed Challenges
  challenges[0].contenders.push(usersDoc[0]._id);
  challenges[0].contenders.push(usersDoc[1]._id);
  challenges[0].contenders.push(usersDoc[2]._id);
  challenges[0].league = leaguesDocs[0]._id;
  challenges[0].game = gamesDoc[0]._id;
  challenges[0].winners.push(usersDoc[1]._id);
  challenges[0].points = 3;

  challenges[1].contenders.push(usersDoc[0]._id);
  challenges[1].contenders.push(usersDoc[1]._id);
  challenges[1].league = leaguesDocs[1]._id;
  challenges[1].game = gamesDoc[1]._id;
  challenges[1].winners.push(usersDoc[1]._id);
  challenges[1].points = 20;


  challenges[2].contenders.push(usersDoc[0]._id);
  challenges[2].contenders.push(usersDoc[1]._id);
  challenges[2].contenders.push(usersDoc[2]._id);
  challenges[2].league = leaguesDocs[0]._id;
  challenges[2].game = gamesDoc[0]._id;
  challenges[2].winners.push(usersDoc[0]._id);
  challenges[2].points = 30;

  challenges[3].contenders.push(usersDoc[0]._id);
  challenges[3].contenders.push(usersDoc[1]._id);
  challenges[3].league = leaguesDocs[1]._id;
  challenges[3].game = gamesDoc[1]._id;
  challenges[3].winners.push(usersDoc[0]._id);
  challenges[3].points = 40;

  challenges[4].contenders.push(usersDoc[0]._id);
  challenges[4].contenders.push(usersDoc[1]._id);
  challenges[4].contenders.push(usersDoc[2]._id);
  challenges[4].league = leaguesDocs[0]._id;
  challenges[4].game = gamesDoc[0]._id;

  challenges[5].contenders.push(usersDoc[0]._id);
  challenges[5].contenders.push(usersDoc[1]._id);
  challenges[5].league = leaguesDocs[1]._id;
  challenges[5].game = gamesDoc[1]._id;

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
