const { Schema, model } = require("mongoose");

const gameSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    description: { type: String },
    imageUrl: { type: String },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Game = model("Game", gameSchema);

module.exports = Game;
