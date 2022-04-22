const router = require("express").Router();

const User = require("../../models/User.model");
const fileUploader = require("../../config/cloudinary.config");
const getUser = require("../../middleware/getUser");
const cloudinary = require("cloudinary").v2;

router.get("/", getUser, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/",
  fileUploader.single("coverPicture"),
  getUser,
  async (req, res, next) => {
    try {
      const id = req.user._id;
      let { username } = req.body;

      const updatedUser = {
        username,
      };
      if (req.file) {
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
        updatedUser.pictureUrl = newImageUrl;
      }
      const updatedUserDoc = await User.findByIdAndUpdate(id, updatedUser, {
        new: true,
      });

      res.json({ updatedUserDoc });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/", getUser, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).send("Successfully deleted the user");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
