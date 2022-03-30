const isLoggedIn = require("../middleware/isLoggedIn");

const router = require("express").Router();

/* GET home page */
router.get("/", isLoggedIn, (req, res, next) => {
  res.render("index");
});

module.exports = router;
