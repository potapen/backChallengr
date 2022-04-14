const router = require("express").Router();
const getUser = require("../../middleware/getUser");
const Comments = require("../../models/Comment.model");

router.get("/challenge/:challengeId", async (req, res, next) => {
    try {
        const {challengeId} = req.params;
        const comments = await Comments.find({challenge: challengeId})
          .populate('user challenge');
        const data = {comments};
        res.json(data);
      }
    catch (error) {
      console.error(error);
      next(error);
    }
});

router.post("/", async (req, res, next) => {
  try {
    const { user, challenge, content } = req.body;
    const commentToCreate = { 
      user,
      challenge,
      content,
    };
      const comment = await Comments.create(commentToCreate);
      const data = {comment};
      res.json(data);
    }
  catch (error) {
    console.error(error);
    next(error);
  }
});


router.put("/:commentId", async (req, res, next) => {
  try {
    const {commentId} = req.params;
    const { user, challenge, content } = req.body;
    const commentToUpdate = { 
      user,
      challenge,
      content,
    };
      const comment = await Comments.findByIdAndUpdate(commentId, commentToUpdate, {new: true})
      const data = {comment};
      res.json(data);
    }
  catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:commentId", async (req, res, next) => {
  try {
    const {commentId} = req.params;
      const comment = await Comments.findByIdAndDelete(commentId);
      const data = {comment};
      res.json(data);
    }
  catch (error) {
    console.error(error);
    next(error);
  }
});
module.exports = router;