const router = require("express").Router();

const League = require("../models/League.model");

router.get("/", async (req, res, next) => {
  try {
    const leagues = await League.find().populate("members");
    res.render("leagues/list-leagues", { leagues });
  } catch {
    next();
  }
});

router.get("/create", async (req, res, next) => {
  try {
    res.render("leagues/create-League");
  } catch {
    next();
  }
});

router.post("/create", async (req, res, next) => {
  try {
    let { name, members, description, inviteKey } = req.body;
    const newLeague = {
      name,
      members,
      description,
      inviteKey,
    };

    await League.create(newLeague);

    res.redirect("/leagues");
  } catch (error) {
    console.log(error);
    next();
  }
});

router.get("/:id/edit", async (req, res, next) => {
  try {
    const id = req.params.id;
    const league = await League.findById(id).populate("members");
    res.render("leagues/edit-League", { league });
  } catch {
    next();
  }
});

router.post("/:id/edit", async (req, res, next) => {
  try {
    const id = req.params.id;
    let { name, members, description, inviteKey } = req.body;
    const newLeague = {
      name,
      members,
      description,
      inviteKey,
    };

    await League.findByIdAndUpdate(id, newLeague);
    res.redirect(`/leagues`);
  } catch {
    next();
  }
});

router.get("/:id/delete", async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    const League = await League.findByIdAndDelete(id);
    res.redirect("/leagues");
  } catch (error) {
    console.log(error);
    next();
  }
});

module.exports = router;
