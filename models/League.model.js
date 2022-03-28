const { Schema, model } = require("mongoose");

const leagueSchema = new Schema({
  name: { type: String, unique: true, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  description: { type: String },
  invite_key: { type: String },
  timestamps: true,
});

const League = model("League", leagueSchema);

module.exports = League;
