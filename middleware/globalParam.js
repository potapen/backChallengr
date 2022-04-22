//this middleware is called by default in all routes.
module.exports = (req, res, next) => {

    res.locals.user =  req.session.user

    next();
  };
  