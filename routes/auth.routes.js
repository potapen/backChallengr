const router = require("express").Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const fileUploader = require("../config/cloudinary.config");
const app = require("../app");
const cloudinary = require("cloudinary").v2;

router.get("/signup", isLoggedOut, (req, res) => {
  try {
    const targetUrl = req.query.targetUrl;
    res.render("auth/signup", { targetUrl });
  } catch {
    next();
  }
});

router.post(
  "/signup",
  fileUploader.single("coverPicture"),
  isLoggedOut,
  (req, res) => {
    const { email, username, password, pictureUrl, targetUrl } = req.body;

    if (!email) {
      return res.status(400).render("auth/signup", {
        errorMessage: "Please provide your email.",
      });
    }

    if (password.length < 8) {
      return res.status(400).render("auth/signup", {
        errorMessage: "Your password needs to be at least 8 characters long.",
      });
    }

    //   ! This use case is using a regular expression to control for special characters and min length
    /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).render("signup", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  */

    // Search the database for a user with the username submitted in the form
    User.findOne({ email }).then((found) => {
      // If the user is found, send the message username is taken
      if (found) {
        return res
          .status(400)
          .render("auth/signup", { errorMessage: "email already taken." });
      }

      // if user is not found, create a new user - start with hashing the password
      return bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => {
          // Create a user and save it in the database
          let pictureUrl = process.env.DEFAULT_PROFILE;
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
            pictureUrl = newImageUrl;
          }
          req.app.locals.profilePicture = pictureUrl;

          return User.create({
            email,
            username,
            password: hashedPassword,
            pictureUrl,
          });
        })
        .then((user) => {
          // Bind the user to the session object
          req.session.user = user;

          if (targetUrl) {
            return res.redirect(targetUrl);
          }
          return res.redirect("/");
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.ValidationError) {
            return res
              .status(400)
              .render("auth/signup", { errorMessage: error.message });
          }
          if (error.code === 11000) {
            return res.status(400).render("auth/signup", {
              errorMessage:
                "Username need to be unique. The username you chose is already in use.",
            });
          }
          return res
            .status(500)
            .render("auth/signup", { errorMessage: error.message });
        });
    });
  }
);

router.get("/login", isLoggedOut, (req, res) => {
  try {
    const targetUrl = req.query.targetUrl;
    res.render("auth/login", { targetUrl });
  } catch {
    next();
  }
});

router.post("/login", isLoggedOut, (req, res, next) => {
  const { email, password, targetUrl } = req.body;

  if (!email) {
    return res.status(400).render("auth/login", {
      errorMessage: "Please provide your email.",
    });
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 8) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  // Search the database for a user with the username submitted in the form
  User.findOne({ email })
    .then((user) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!user) {
        return res.status(400).render("auth/login", {
          errorMessage: "Wrong credentials.",
        });
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).render("auth/login", {
            errorMessage: "Wrong credentials.",
          });
        }
        req.session.user = user;
        req.app.locals.profilePicture = user.pictureUrl;

        if (targetUrl) {
          return res.redirect(targetUrl);
        }
        // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
        // res.locals.user = user.username; //marche pas ici car res correspond seulement à la réponse localse
        return res.redirect("/");
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    res.redirect("/");
  });
});

module.exports = router;
