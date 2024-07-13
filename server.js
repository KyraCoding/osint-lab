// Used for hosting
import express from "express";
const app = express();

// General Utility
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

// Database Access
import mongoose from "mongoose";

// Mongoose schema models
import Auth_user from "./model/Auth_user.js";
import Challenge from "./model/Challenge.js";

// Authentication and Security
import { createHash } from "crypto";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
const MongoStore = MongoDBStore(session);

// Sanitizing and Validation
import sanitize from "mongo-sanitize";
import { body, validationResult } from "express-validator";

// Hash Function
function hash(input) {
  return createHash("sha256", process.env.HASH_SECRET)
    .update(input)
    .digest("base64");
}

// Use mongoose
mongoose.connect(
  "mongodb+srv://" +
    process.env.DATABASE_USERNAME +
    ":" +
    process.env.DATABASE_PASSWORD +
    "@radiata.0g6mder.mongodb.net/tanuki?retryWrites=true&w=majority&appName=radiata"
);

// Connect to database for storing sessions
const session_db = new MongoStore({
  uri:
    "mongodb+srv://" +
    process.env.DATABASE_USERNAME +
    ":" +
    process.env.DATABASE_PASSWORD +
    "@radiata.0g6mder.mongodb.net/tanuki?retryWrites=true&w=majority&appName=radiata",
  collection: "sessions",
  // Currently set to 14 days
  expires: 1000 * 60 * 60 * 24 * 14,
});

// Wonder what this could be 🤔
app.use(function (req, res, next) {
  res.setHeader("X-Powered-By", process.env.FLAG_POWERED_BY);
  next();
});

// Set up sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET, // SHHHH KEEP IT SECRET
    name: "session token", // I MEAN IN CASE YOU COULDNT READ
    saveUninitialized: false, // SAVE EVEN IF NOTHING CHANGED (I THINK)
    resave: true, // THEY TOLD ME TO TURN THIS ON
    httpOnly: true, // NO CLIENT COOKIE READING?
    secure: true, // NO HTTP HAHA
    sameSite: "strict", // NO CSRF HAHAHA
    store: session_db, // SAVE TO DATABASE WOOOOO
  })
);

// Set up rendering
app.set("view engine", "ejs");

// Set up login state
app.use(function (req, res, next) {
  res.locals.loggedIn = req.session.loggedIn || false;
  res.locals.title =
    req.path.split("/")[1] != ""
      ? toTitleCase(req.path.split("/")[1].replace(/-/g, " "))
      : "Home";
  next();
});

// Anything in this folder is being served
app.use(express.static(path.join(__dirname, "views/assets")));

// Parse request body
app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true }));

// Host root
app.get("/", (req, res) => {
  res.render("pages/home", {});
});

// Host beta site
/*
app.get("/beta", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "beta.html"));
});
*/

// Host register page
app.get("/register", (req, res) => {
  res.render("pages/register", {});
});

app.get("/register/email", (req, res) => {
  res.render("pages/register_email", {
    prev_values: {},
    errors: {},
  });
});

// Post request handling for registering a user
app.post(
  "/register/email",
  [
    body("email")
      .isEmail()
      .withMessage("Invalid email address!")
      .custom(async (value) => {
        const user = await Auth_user.findOne({ email: value });
        if (user) {
          return Promise.reject("Email is taken!");
        }
      }),
    body("username")
      .isLength({ min: 1 })
      .withMessage("Username is required!")
      .matches(/^[a-z0-9_]+$/)
      .withMessage(
        "Username can only contain lowercase letters, numbers or underscores!"
      )
      .custom(async (value) => {
        const user = await Auth_user.findOne({ username: value });
        if (user) {
          return Promise.reject("Username is taken!");
        }
      }),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long!"),
  ],
  async (req, res, next) => {
    // Let's hope this was empty
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {});
      return res.render("pages/register_email", {
        errors: formattedErrors,
        prev_values: req.body,
      });
    }

    // We use try catch in case something breaks
    try {
      // Hash parameters for security. This will use a secret so it can be reversed
      const username = sanitize(req.body.username).trim();
      const password = sanitize(req.body.password);
      const email = sanitize(req.body.email).trim();

      // Create auth_user schema
      const newUser = new Auth_user({
        email,
        username,
        password,
      });
      await newUser.save();

      // Add session token
      req.session.loggedIn = true;

      // User added!
      res.redirect("/");
    } catch (e) {
      // ono :<
      console.log(e);

      // Send 500
      return res.render("pages/register_email", {
        errors: { server_error: "An unknown error occurred!" },
      });
    }
  }
);

app.get("/login", (req, res) => {
  res.render("pages/login", {});
});

app.get("/login/email", [], (req, res) => {
  res.render("pages/login_email", {
    errors: {},
  });
});

app.post(
  "/login/email",
  [
    body("username").isLength({ min: 1 }).withMessage("Username is required!"),
    body("password").isLength({ min: 1 }).withMessage("Password is required!"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {});
      return res.render("pages/login_email", {
        errors: formattedErrors,
      });
    }
    const { username, password } = req.body;

    // We use a try and catch loop in case anything fails, that way it doesn't crash the server
    try {
      // Hash for security, also uses a secret
      const username = sanitize(req.body.username).toLowerCase().trim();
      const password = sanitize(req.body.password);

      // Try to find user
      const user = await Auth_user.findOne({ username });

      // Make sure password is correct and user exists
      if (user && (await user.comparePassword(password))) {
        // Add session token
        req.session.loggedIn = true;
        res.redirect("/");
      } else {
        return res.render("pages/login_email", {
          errors: { invalid: "Invalid username or password!" },
        });
      }
    } catch (e) {
      // 500 handling
      console.log(e);
      return res.render("pages/login_email", {
        errors: { server_error: "An unknown error occurred!" },
      });
    }
  }
);

app.get("/profile", (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/login");
  } else {
    res.sendFile(path.join(__dirname, "public", "profile.html"));
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/practice", async (req, res, next) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }
  try {
    const categories = ["socmint", "geoint", "sigint", "misc"];
    const difficulties = ["beginner", "easy", "medium", "hard"];
    var challenges = {};
    for (var i = 0; i < categories.length; i++) {
      var challenge_group = await Challenge.find({
        category: categories[i].toUpperCase(),
      })
        .sort({ difficulty: 1, score: 1 })
        .select("title solvedBy description score solveCount difficulty author")
        .lean();
      challenge_group.forEach((obj) => {
        obj.difficulty = difficulties[obj.difficulty];
      });
      challenges[categories[i]] = challenge_group;
    }

    res.render("pages/practice", {
      challenges: challenges,
    });
  } catch (err) {
    console.log(err);
    next(500);
  }
});

app.post(
  "/verify/flag",
  [
    body("id")
      .isLength({ min: 1 })
      .withMessage("Someone forgot their challenge id..."),
    body("flag")
      .isLength({ min: 1 })
      .withMessage("Were you just testing the submit button?"),
    body("flag")
      .matches("^flag{.*?}$")
      .withMessage("Flag must be in format flag{}!"),
  ],
  async (req, res, next) => {
    console.log(sanitize(req.body))
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(
        JSON.stringify({
          msg: Object.values(errors.errors)[0].msg,
          success: false,
        })
      );
    }
    try {
      const _id = sanitize(req.body.id);
      const flag = sanitize(req.body.flag).trim();
      const challenge = await Challenge.findOne({ _id });
      if (!challenge) {
        return res.send(
          JSON.stringify({
            msg: "No such challenge found...",
            success: false,
          })
        );
      }
      if (flag === challenge.flag) {
        return res.send(
          JSON.stringify({
            msg: "Flag correct!",
            success: true,
          })
        );
      } else {
        return res.send(
          JSON.stringify({
            msg: "Flag incorrect...",
            success: false,
          })
        );
      }
    } catch (err) {
      console.log(err);
      next(500);
    }

    res.send(JSON.stringify({ success: true }));
  }
);

app.get("/learn", (req, res, next) => {
  next(501);
});
app.get("/compete", (req, res, next) => {
  next(501);
});
app.get("/about", (req, res, next) => {
  next(501);
});
app.get("/privacy-policy", (req, res, next) => {
  next(501);
});
app.get("/contact", (req, res, next) => {
  next(501);
});

// Handle 404
app.use((req, res, next) => {
  next(404);
});

// Finally built this, yay!
app.use((err, req, res, next) => {
  res.render("pages/error", {
    err: err,
    title: err,
  });
});

// Go Go Go!
app.listen(process.env.PORT, () => {
  const currentDate = new Date();
  console.log(`Server successfully started on ${currentDate}!`);
});
