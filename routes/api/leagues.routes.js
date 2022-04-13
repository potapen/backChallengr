const router = require("express").Router();

const League = require("../../models/League.model");
const User = require("../../models/User.model");
const isLoggedIn = require("../../middleware/isLoggedIn");
const fileUploader = require("../../config/cloudinary.config");
const cloudinary = require("cloudinary").v2;

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const leagues = await League.find({
      members: req.session.user._id,
    }).populate("members");
    res.render("leagues/list-leagues", { leagues });
  } catch {
    next();
  }
});

router.get("/create", isLoggedIn, async (req, res, next) => {
  try {
    res.render("leagues/create-league");
  } catch {
    next();
  }
});

router.post(
  "/create",
  fileUploader.single("coverPicture"),
  isLoggedIn,
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

      const user = await User.findById(req.session.user._id);
      newLeague.members.push(user._id);

      newLeagueDoc = await League.create(newLeague);
      newLeague.inviteKey = newLeagueDoc._id;

      newLeagueDoc = await League.findByIdAndUpdate(
        newLeagueDoc._id,
        newLeague
      );

      res.redirect(`/leagues/${newLeagueDoc._id}/invite`);
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

router.get("/:id/edit", isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id;
    const league = await League.findById(id).populate("members");
    res.render("leagues/edit-league", { league });
  } catch {
    next();
  }
});

router.post(
  "/:id/edit",
  fileUploader.single("coverPicture"),
  isLoggedIn,
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

router.get("/:id/delete", isLoggedIn, async (req, res, next) => {
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

router.get("/:id/leave", isLoggedIn, async (req, res, next) => {
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

router.get("/:id/invite", isLoggedIn, async (req, res, next) => {
  try {
    const id = req.params.id;
    const league = await League.findById(id);
    res.render("leagues/invite-league", { league });
  } catch (error) {
    console.log(error);
    next();
  }
});

router.get("/join", isLoggedIn, async (req, res, next) => {
  try {
    res.render("leagues/join-league");
  } catch (error) {
    console.log(error);
    next();
  }
});

router.get("/join/:id", isLoggedIn, async (req, res, next) => {
  try {
    const inviteKey = req.params.id;
    console.log(inviteKey);
    res.render("leagues/join-league", { inviteKey });
  } catch (error) {
    console.log(error);
    next();
  }
});

router.post("/join", isLoggedIn, async (req, res, next) => {
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
