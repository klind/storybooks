const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const connectDB = require("./config/db");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const expresssession = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo")(expresssession);
const mongoose = require("mongoose");
const methodOverride = require('method-override')


// Load config
dotenv.config({ path: "./config/config.env" });
// Passport config
require("./config/passport")(passport);

connectDB();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Sessions
app.use(
  expresssession({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Handlebars helper
const { formatDate, stripTags, truncate, editIcon, select } = require("./helpers/hbs");

// Handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: {
      formatDate, stripTags, truncate, editIcon, select
    },
    defaultLayout: "main",
    extname: ".hbs",
    partialsDir: "./views/partials",
  })
);
app.set("view engine", ".hbs");

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next()
})

// Static folders
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
