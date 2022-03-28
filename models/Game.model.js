const { Schema, model } = require("mongoose");

const gameSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    description: { type: String },
    isPrivate: { type: Boolean },
    ownerLeagues: [{ type: Schema.Types.ObjectId, ref: "League" }],
    emoji: { type: String, maxLength: 2 },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Game = model("Game", gameSchema);

module.exports = Game;
