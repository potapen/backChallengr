// ℹ️ package responsible to make the connection with mongodb
// https://www.npmjs.com/package/mongoose
const mongoose = require("mongoose");
const Celebrity = require("../models/Celebrity.model");
const Movie = require("../models/Movie.model");

// ℹ️ Sets the MongoDB URI for our app to have access to it.
// If no env has been set, we dynamically set it to whatever the folder name was upon the creation of the app

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost/lab-movies-celebrities";

const celebrities = [
  {
    name: "Brad Pitt",
    occupation: "Actor",
    catchPhrase: "I love Tibet",
  },
  {
    name: "Tom Cruise",
    occupation: "Actor also",
    catchPhrase: "I love difficult missions",
  },
  {
    name: "Uma Turman",
    occupation: "Actress",
    catchPhrase: "I love Brad Pitt",
  },
];

const movies = [
  {
    title: "Mission impossible 1",
    genre: "Action",
    plot: "Very difficult missions",
    cast: [],
  },
  {
    title: "Mission difficult 2",
    genre: "Action",
    plot: "Very impossible missions",
    cast: [],
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

  await Celebrity.deleteMany();
  console.log("Celebrities deleted");

  await Movie.deleteMany();
  console.log("Movies deleted");

  newCelebrities = await Celebrity.insertMany(celebrities);
  console.log("Celebrities inserted");

  movies[0].cast.push(newCelebrities[0]._id);
  movies[0].cast.push(newCelebrities[2]._id);
  movies[1].cast.push(newCelebrities[1]._id);
  movies[1].cast.push(newCelebrities[2]._id);
  await Movie.insertMany(movies);
  console.log("Movies inserted");
  await mongoose.disconnect();
  console.log("DB disconnected");
}

seedDB();
