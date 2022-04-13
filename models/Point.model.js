const { Schema, model } = require("mongoose");

const pointSchema = new Schema(
  {
    game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    league: { type: Schema.Types.ObjectId, ref: "League", required: true },
    points: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

const Point = model("Point", pointSchema);

module.exports = Point;
