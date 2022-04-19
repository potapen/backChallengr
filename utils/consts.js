const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/challengr-v";
const SERVERHOST = process.env.LOCALHOST || "https://ironhackchallengr.herokuapp.com";

console.log("MONGO_URI", MONGO_URI)
console.log("process.env.MONGODB_URI", process.env.MONGODB_URI)
console.log("process.env.TOKEN_SECRET", process.env.TOKEN_SECRET)
module.exports = {SERVERHOST,MONGO_URI};
