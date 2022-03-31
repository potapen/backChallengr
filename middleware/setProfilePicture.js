module.exports = (req, res, next) => {
  try {
    if (!req.session.user) {
      res.locals.profilePicture = process.env.DEFAULT_PROFILE;
    } else {
      res.locals.profilePicture = req.session.user.pictureUrl;
    }
    next();
  } catch {
    res.locals.profilePicture = process.env.DEFAULT_PROFILE;
    next();
  }
};
