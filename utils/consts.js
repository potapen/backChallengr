const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost/challengr";
const SERVERHOST = process.env.LOCALHOST || "https://ironhackchallengr.herokuapp.com";
module.exports = MONGO_URI;
// module.exports = {SERVERHOST,MONGO_URI};
