const isLoggedIn = require("../middleware/isLoggedIn");
const League = require("../models/League.model");

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
    res.render("index", { hasNoLeague });
  } catch {
    next();
  }
});

module.exports = router;
