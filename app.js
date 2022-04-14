// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalized = require("./utils/capitalized");
const projectName = "challengr";

const { isAuthenticated } = require("./middleware/jwt.middleware");

//locals is reachable from hbs views.
/*
locals is reachable from hbs views.
app.locals is reachable everywhere 
while res.locals in the middleware only live for the duration of the request/response
*/
app.locals.appTitle = `Project ${capitalized(projectName)} by Ze !Dream Team`;

app.use(require("./middleware/setProfilePicture"));
app.use(require("./middleware/setLoginState"));

// 👇 api routes
const authRoutesApi = require("./routes/api/auth.routes");
app.use("/api/auth", authRoutesApi);

const challengeRoutesApi = require("./routes/api/challenges.routes");
app.use("/api/challenges", isAuthenticated, challengeRoutesApi);

const gamesRoutesApi = require("./routes/api/games.routes");
app.use("/api/games", isAuthenticated, gamesRoutesApi);

const leaguesRoutesApi = require("./routes/api/leagues.routes");
app.use("/api/leagues", isAuthenticated, leaguesRoutesApi);

const pointsRoutesApi = require("./routes/api/points.routes");
app.use("/api/points", isAuthenticated, pointsRoutesApi);

const boardsRoutesApi = require("./routes/api/boards.routes");
app.use("/api/boards", isAuthenticated, boardsRoutesApi);

const statsRoutesApi = require("./routes/api/stats.routes");
app.use("/api/stats", isAuthenticated, statsRoutesApi);

const profileRoutesApi = require("./routes/api/profile.routes");
app.use("/api/profile", isAuthenticated, profileRoutesApi);

const commentsRoutesApi = require("./routes/api/comments.routes");
app.use("/api/comments", isAuthenticated, commentsRoutesApi);

// 👇 v1 routes
const index = require("./routes/v1/index.routes");
app.use("/v1/", index);

const authRoutes = require("./routes/v1/auth.routes");
app.use("/v1/auth", authRoutes);

const challengeRoutes = require("./routes/v1/challenge.routes");
app.use("/v1/challenge", challengeRoutes);

const gamesRoutes = require("./routes/v1/games.routes");
app.use("/v1/games", gamesRoutes);

const leaguesRoutes = require("./routes/v1/leagues.routes");
app.use("/v1/leagues", leaguesRoutes);

const boardsRoutes = require("./routes/v1/boards.routes");
app.use("/v1/boards", boardsRoutes);

const graphsRoutes = require("./routes/v1/graphs.routes");
app.use("/v1/graphs", graphsRoutes);

const profileRoutes = require("./routes/v1/profile.routes");
app.use("/v1/profile", profileRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
