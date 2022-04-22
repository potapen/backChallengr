const router = require("express").Router();

const Game = require("../../models/Game.model");
const League = require("../../models/League.model");
const Point = require("../../models/Point.model");
const fileUploader = require("../../config/cloudinary.config");
const cloudinary = require("cloudinary").v2;

router.get("/", async (req, res, next) => {
  try {
    const games = await Game.find();
    res.json({ games });
  } catch {
    next();
  }
});

router.get("/:gameId", async (req, res, next) => {
  try {
    const id = req.params.gameId;
    const game = await Game.findById(id);
    res.json({ game });
  } catch {
    next();
  }
});

router.post(
  "/",
  fileUploader.single("coverPicture"),
  async (req, res, next) => {
    try {
      let { name, description } = req.body;
      const newGame = {
        name,
        description,
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
      newGameDoc = await Game.create(newGame);

      // Set new Points for the new game
      const leagues = await League.find();
      await Promise.all(
        leagues.map((league) => {
          return Point.create({ game: newGameDoc._id, league: league._id });
        })
      );

      res.json({ newGameDoc });
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

router.put(
  "/:id",
  fileUploader.single("coverPicture"),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      let { name, description } = req.body;
      const updatedGame = {
        name,
        description,
      };
      if (req.file) {
        let newImageUrl = cloudinary.url(req.file.filename, {
          width: 400,
          height: 260,
          gravity: "auto",
          crop: "fill",
        });
        updatedGame.imageUrl = newImageUrl;
      }

      const updatedGameDoc = await Game.findByIdAndUpdate(id, updatedGame, {
        new: true,
      });
      res.json({ updatedGameDoc });
    } catch {
      next();
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    await Game.findByIdAndDelete(id);
    res.status(200).send("Successfully deleted the game");
  } catch (error) {
    console.log(error);
    next();
  }
});

module.exports = router;
