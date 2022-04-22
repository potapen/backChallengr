const router = require("express").Router();

const Game = require("../../models/Game.model");
const League = require("../../models/League.model");
const fileUploader = require("../../config/cloudinary.config");
const cloudinary = require("cloudinary").v2;

router.get("/", async (req, res, next) => {
  try {
    userLeagues = await League.find({
      members: req.session.user._id,
    }).select("_id");
    leagueIdsArray = userLeagues.map((league) => league._id);

    const games = await Game.find({
      $or: [
        { isPrivate: false },
        // { ownerLeagues: { $elemMatch: { $in: leagueIdsArray } } },
        { ownerLeagues: { $in: leagueIdsArray } },
      ],
    }).populate("ownerLeagues");
    res.render("games/list-games", { games });
  } catch {
    next();
  }
});

router.get("/create", async (req, res, next) => {
  try {
    const leagues = await League.find({
      members: req.session.user._id,
    });
    res.render("games/create-game", { leagues });
  } catch {
    next();
  }
});

router.post(
  "/create",
  fileUploader.single("coverPicture"),
  async (req, res, next) => {
    try {
      let { name, emoji, description, isPrivate, ownerLeagues } = req.body;
      isPrivate = isPrivate === "on";
      const newGame = {
        name,
        description,
        isPrivate,
        ownerLeagues,
        emoji,
      };

      if (req.file) {
        let newImageUrl = cloudinary.url(req.file.filename, {
          width: 400,
          height: 260,
          gravity: "auto",
          crop: "fill",
        });
        newGame.imageUrl = newImageUrl;
      } else {
        newGame.imageUrl =
          "https://res.cloudinary.com/dwfrbljbo/image/upload/v1648648579/challengr/i7xfdmnxgwaf7yv0qogm.jpg";
      }

      await Game.create(newGame);

      res.redirect("/games");
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id/edit", async (req, res, next) => {
  try {
    const id = req.params.id;
    const game = await Game.findById(id);

    const selectedLeagues = await League.find({
      $and: [
        { members: req.session.user._id },
        { _id: { $in: game.ownerLeagues } },
      ],
    });
    const unselectedLeagues = await League.find({
      $and: [
        { members: req.session.user._id },
        { _id: { $nin: game.ownerLeagues } },
      ],
    });
    res.render("games/edit-game", { game, selectedLeagues, unselectedLeagues });
  } catch {
    next();
  }
});

router.post(
  "/:id/edit",
  fileUploader.single("coverPicture"),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      let { name, emoji, description, isPrivate, ownerLeagues } = req.body;
      isPrivate = isPrivate === "on";
      const newGame = {
        name,
        description,
        isPrivate,
        ownerLeagues,
        emoji,
      };
      if (req.file) {
        let newImageUrl = cloudinary.url(req.file.filename, {
          width: 400,
          height: 260,
          gravity: "auto",
          crop: "fill",
        });
        newGame.imageUrl = newImageUrl;
      }

      await Game.findByIdAndUpdate(id, newGame);
      res.redirect(`/games`);
    } catch {
      next();
    }
  }
);

router.get("/:id/delete", async (req, res, next) => {
  try {
    const id = req.params.id;
    const game = await Game.findByIdAndDelete(id);
    res.redirect("/games");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
