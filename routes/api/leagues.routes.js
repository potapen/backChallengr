const router = require("express").Router();

const League = require("../../models/League.model");
const Game = require("../../models/Game.model");
const Challenge = require("../../models/Challenge.model");
const Point = require("../../models/Point.model");
const User = require("../../models/User.model");
const getUser = require("../../middleware/getUser");
const fileUploader = require("../../config/cloudinary.config");
const isLeagueMember = require("../../middleware/isLeagueMember");
const cloudinary = require("cloudinary").v2;

// Returns all leagues the logged user is part of
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

// Returns a league by ID
router.get("/:leagueId", getUser, isLeagueMember, async (req, res, next) => {
  try {
    const league = await League.findById(req.league._id).populate("members");
    res.json({ league });
  } catch {
    next();
  }
});

// Creates a new league, and sets the logged user as a member
router.post(
  "/",
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
      // Add a picture field in case a file was submitted
      if (req.file) {
        let newImageUrl = cloudinary.url(req.file.filename, {
          width: 500,
          height: 500,
          gravity: "faces",
          crop: "fill",
        });
        newLeague.imageUrl = newImageUrl;
      } else {
        newLeague.imageUrl =
          "https://res.cloudinary.com/dwfrbljbo/image/upload/v1648648579/challengr/i7xfdmnxgwaf7yv0qogm.jpg";
      }

      // Add current user as the first member
      newLeague.members.push(req.user._id);
      newLeagueDoc = await League.create(newLeague);

      // Invite key generation
      newLeague.inviteKey = newLeagueDoc._id;
      newLeagueDoc = await League.findByIdAndUpdate(
        newLeagueDoc._id,
        newLeague
      );

      // Set new Points for the new league
      const games = await Game.find();
      await Promise.all(
        games.map((game) => {
          return Point.create({ game: game._id, league: newLeagueDoc._id });
        })
      );

      res.status(201).json({ newLeagueDoc });
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

// Edits a single league by id
router.put(
  "/:leagueId",
  getUser,
  isLeagueMember,
  fileUploader.single("coverPicture"),
  async (req, res, next) => {
    try {
      let { name, members, description } = req.body;

      const updatedLeague = {
        name,
        description,
      };
      if (members) {
        membersDoc = await User.find({ _id: { $in: members.split(",") } });
        members = membersDoc.map((memberDoc) => {
          return memberDoc._id;
        });
        updatedLeague.members = members;
      }
      if (req.file) {
        let newImageUrl = cloudinary.url(req.file.filename, {
          width: 500,
          height: 500,
          gravity: "faces",
          crop: "fill",
        });
        if (newImageUrl) {
          updatedLeague.imageUrl = newImageUrl;
        }
      }
      const updatedLeagueDoc = await League.findByIdAndUpdate(
        req.league._id,
        updatedLeague,
        {
          new: true,
        }
      );
      res.json({ updatedLeagueDoc });
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

// Set the league to favorite of the user
router.patch(
  "/:leagueId/favorite",
  getUser,
  isLeagueMember,
  async (req, res, next) => {
    try {
      console.log("hello");
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          favoriteLeague: req.league._id,
        },
        { new: true }
      );
      res.json({ updatedUser });
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

// Remove the logged user from the league in the url
router.patch(
  "/:leagueId/leave",
  getUser,
  isLeagueMember,
  async (req, res, next) => {
    try {
      const league = req.league;
      if (league.members.length === 1) {
        console.log("Last member wants to leave");
        res.status(401).send({
          message:
            "You cannot leave a league where you are the only member left. Please delete the league instead.",
        });
        return;
      }
      console.log("Let's keep going");
      league.members = league.members.filter(
        (member) => !member.equals(req.user._id)
      );
      await League.findByIdAndUpdate(req.league._id, league);

      res.status(200).send("Successfully left the league");
    } catch (error) {
      console.log(error);
      next();
    }
  }
);

// Adds the logged user to the league in the body
router.patch("/join", getUser, async (req, res, next) => {
  try {
    const { inviteKey } = req.body;
    const league = await League.findOne({
      $and: [{ inviteKey: inviteKey }, { members: { $ne: req.user._id } }],
    });
    if (!league) {
      res.status(401).send("Invite key was already used or not valid");
      return;
    }
    league.members.push(req.user._id);
    joinedLeague = await League.findByIdAndUpdate(inviteKey, league, {
      new: true,
    });

    res.status(200).send({ joinedLeague });
  } catch (error) {
    console.log(error);
    next();
  }
});

// Removes the logged user from the league in the url
router.delete("/:leagueId", getUser, isLeagueMember, async (req, res, next) => {
  try {
    await League.findByIdAndDelete(req.league._id);
    res.status(200).send("Successfully deleted the league");
  } catch (error) {
    console.log(error);
    next();
  }
});

module.exports = router;
