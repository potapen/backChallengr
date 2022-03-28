const { Schema, model } = require("mongoose");

const leagueSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    description: { type: String },
    inviteKey: { type: String, unique: true },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const League = model("League", leagueSchema);

module.exports = League;
