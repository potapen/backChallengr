const router = require("express").Router();

const User = require("../models/User.model");
const League = require("../models/League.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const fileUploader = require("../config/cloudinary.config");
const app = require("../app");
const cloudinary = require("cloudinary").v2;

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    const leagues = await League.find({
      members: req.session.user._id,
    });
    res.render("profile/view-profile", { user, leagues });
  } catch (error) {
    console.log(error);
    next();
  }
});

router.get("/edit", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render("profile/edit-profile", { user });
  } catch {
    next();
  }
});

router.post(
  "/edit",
  fileUploader.single("coverPicture"),
  isLoggedIn,
  async (req, res, next) => {
    try {
      const id = req.session.user._id;
      let { username } = req.body;

      const newUser = {
        username,
      };
      let newImageUrl = cloudinary.url(req.file.filename, {
        transformation: [
          {
            aspect_ratio: "1.0",
            gravity: "face",
            width: "0.6",
            zoom: "0.7",
            crop: "thumb",
          },
          { radius: "max" },
          { color: "black", effect: "outline" },
        ],
      });
      console.log(newImageUrl);
      if (newImageUrl) {
        newUser.pictureUrl = newImageUrl;
        req.app.locals.profilePicture = newImageUrl;
      }
      await User.findByIdAndUpdate(id, newUser);
      res.redirect(`/profile`);
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

module.exports = router;
