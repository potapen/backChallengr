const { Schema, model } = require("mongoose");

const contenderSchema = new Schema(
  {
    contender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Contender = model("Contender", contenderSchema);

module.exports = Contender;
