const { Schema, model } = require("mongoose");

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  challenge: { type: Schema.Types.ObjectId, ref: "Challenge", required: true },
  content: { type: String },
  rating: { type: Number, min: 0, max: 5 },
  timestamps: true,
});

const Review = model("Review", reviewSchema);

module.exports = Review;
