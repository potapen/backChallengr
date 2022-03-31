module.exports = (req, res, next) => {
  if (!req.user) {
    res.locals.profilePicture = process.env.DEFAULT_PROFILE;
  } else {
    res.locals.profilePicture = req.session.user.pictureUrl;
  }
  next();
};
