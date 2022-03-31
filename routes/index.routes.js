const isLoggedIn = require("../middleware/isLoggedIn");
const League = require("../models/League.model");
const Challenge = require("../models/Challenge.model");

const router = require("express").Router();

/* GET home page */
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    let hasNoLeague = false;
    const league = await League.findOne({
      members: req.session.user._id,
    });
    if (!league) {
      hasNoLeague = true;
    }

    const ongoingChallenges = await Challenge.find({
      $and: [
        { contenders: req.session.user._id },
        { $or: [{ isCompleted: { $exists: false } }, { isCompleted: false }] },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("contenders game league")
      .lean()
      .exec();
    ongoingChallenges.forEach((challenge) => {
      challenge.createdAt = challenge.createdAt.toLocaleDateString();
    });
    console.log(ongoingChallenges);

    res.render("index", { hasNoLeague, ongoingChallenges });
  } catch (error) {
    console.log(error);
    next();
  }
});

module.exports = router;
