const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    content: { type: String },
    rating: { type: Number, min: 0, max: 5 },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Comment = model("Comment", commentSchema);

module.exports = Comment;
