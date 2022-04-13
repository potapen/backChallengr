const { Schema, model } = require("mongoose");

const leagueSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    description: { type: String },
    inviteKey: { type: String },
    imageUrl: { type: String },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

// schema.post('remove', function(doc) {
//   console.log('%s has been removed', doc._id);
// });

const League = model("League", leagueSchema);

module.exports = League;
