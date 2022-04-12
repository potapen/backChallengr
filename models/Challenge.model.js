const { Schema, model } = require("mongoose");

const challengeSchema = new Schema(
  {
    contenders: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    league: { type: Schema.Types.ObjectId, ref: "League", required: true },
    game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    winners: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isCompleted: { type: Boolean },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Challenge = model("Challenge", challengeSchema);

module.exports = Challenge;
