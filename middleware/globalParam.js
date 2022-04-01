//this middleware is called by default in all routes.
module.exports = (req, res, next) => {
    console.log('globalParams')

    res.locals.user =  req.session.user
    console.log('res.locals.user =  req.session.user')
    next();
  };
  