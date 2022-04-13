const router = require("express").Router();

const League = require("../../models/League.model");
const User = require("../../models/User.model");
const getUser = require("../../middleware/getUser");
const fileUploader = require("../../config/cloudinary.config");
const cloudinary = require("cloudinary").v2;

router.get("/", getUser, async (req, res, next) => {
  try {
    const leagues = await League.find({
      members: req.user._id,
    }).populate("members");
    res.json({ leagues });
  } catch {
    next();
  }
});

router.post(
  "/create",
  getUser,
  fileUploader.single("coverPicture"),
  async (req, res, next) => {
    try {
      let { name, description } = req.body;

      const newLeague = {
        name,
        description,
        members: [],
      };

      if (req.file) {
        let newImageUrl = cloudinary.url(req.file.filename, {
          width: 500,
          height: 500,
          gravity: "faces",
          crop: "fill",
        });
        newLeague.imageUrl = newImageUrl;
      }

      const user = await User.findById(req.user._id);
      newLeague.members.push(user._id);

      newLeagueDoc = await League.create(newLeague);
      newLeague.inviteKey = newLeagueDoc._id;

      newLeagueDoc = await League.findByIdAndUpdate(
        newLeagueDoc._id,
        newLeague
      );

      res.json({ newLeagueDoc });
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

router.put(
  "/:id/edit",
  fileUploader.single("coverPicture"),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      let { name, members, description } = req.body;

      const newLeague = {
        name,
        members,
        description,
      };
      let newImageUrl = cloudinary.url(req.file.filename, {
        width: 500,
        height: 500,
        gravity: "faces",
        crop: "fill",
      });
      console.log(newImageUrl);
      if (newImageUrl) {
        newLeague.imageUrl = newImageUrl;
      }
      await League.findByIdAndUpdate(id, newLeague);
      res.redirect(`/leagues`);
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const league = await League.findByIdAndDelete(id);
    res.redirect("/leagues");
  } catch (error) {
    console.log(error);
    next();
  }
});

router.post("/leave", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const league = await League.findById(id);
    league.members = league.members.filter(
      (member) => !member.equals(req.session.user._id)
    );
    const updatedLeague = await League.findByIdAndUpdate(id, league);

    res.redirect("/leagues");
  } catch (error) {
    console.log(error);
    next();
  }
});

router.post("/join", async (req, res, next) => {
  try {
    const { inviteKey } = req.body;
    const league = await League.findById(inviteKey);

    const user = await User.findById(req.session.user._id);

    league.members.push(user._id);
    await League.findByIdAndUpdate(inviteKey, league);

    res.redirect("/");
  } catch (error) {
    console.log(error);
    next();
  }
});

module.exports = router;
