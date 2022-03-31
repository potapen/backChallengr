module.exports = (req, res, next) => {
  if (!req.session.user) {
    res.locals.isLoggedIn = false;
  } else {
    res.locals.isLoggedIn = true;
  }
  next();
};
