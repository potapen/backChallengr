const { Schema, model } = require("mongoose");

const challengeSchema = new Schema({
  contenders: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  leagues: [{ type: Schema.Types.ObjectId, ref: "League" }],
  game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  winners: [{ type: Schema.Types.ObjectId, ref: "User" }],
  stake: { type: Number, min: 0, required: true },
  isCompleted: { type: Boolean },
  timestamps: true,
});

const Challenge = model("Challenge", challengeSchema);

module.exports = Challenge;
