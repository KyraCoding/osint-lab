// Used for hosting
import express from "express";
const app = express();

// General Utility
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Access
import mongoose from "mongoose";

// Mongoose schema models
import auth_user from "./model/auth_user.js";

// Authentication and Security
import sanitize from "mongo-sanitize";
import { createHash } from "crypto";
import session from "express-session";
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
    "@radiata.0g6mder.mongodb.net/?retryWrites=true&w=majority&appName=radiata"
);

// Wonder what this could be 🤔
app.use(function (req, res, next) {
  res.setHeader("X-Powered-By", process.env.FLAG_POWERED_BY);
  next();
});

// Set up sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "session token",
    saveUninitialized: false,
    resave: true,
  })
);

// Set up rendering
app.set("view engine", "ejs");

// Anything in this folder is being served
app.use(express.static(path.join(__dirname, "public")));

// Parse request body
app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true }));

// Host root
app.get("/", (req, res) => {
  res.render("pages/home", {
    page: {
      title: "Home",
      loggedIn: req.session.loggedIn,
    },
  });
});

// Host beta site
/*
app.get("/beta", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "beta.html"));
});
*/

// Host register page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/register/email", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register_email.html"));
});

// Post request handling for registering a user
app.post(
  "/register_email",
  [
    body("email")
      .isEmail()
      .withMessage("Invalid email address!")
      .custom(async (value) => {
        const user = await auth_user.findOne({ email: value });
        if (user) {
          return Promise.reject("Email is taken!");
        }
      }),
    body("username")
      .isLength({ min: 1 })
      .withMessage("Username is required")
      .custom(async (value) => {
        const user = await auth_user.findOne({ username: value });
        if (user) {
          return Promise.reject("Username already in use");
        }
      }),
    body("name").not().isEmpty().withMessage("Name is required"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  async (req, res, next) => {
    // Let's hope this was empty
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(400);
    }

    // We use try catch in case something breaks
    try {
      // Hash parameters for security. This will use a secret so it can be reversed
      const username = sanitize(req.body.password);
      const password = sanitize(req.body.password);
      const email = sanitize(req.body.email);
      const name = sanitize(req.body.name);

      // Create auth_user schema
      const newUser = new auth_user({ email, username, name, password });
      await newUser.save();
      
      // Add session token
      req.session.loggedIn = true;

      // User added!
      res.redirect("/");
    } catch (e) {
      // ono :<
      console.log(e);

      // Send 500
      next(500);
      res.send(e);
    }
  }
);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login/email", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login_email.html"));
});

app.post("/login_email", async (req, res, next) => {
  // User did not supply username and/or password
  if (!(req.body.username && req.body.password)) {
    console.log("username/password missing");

    // Send them back to login!
    res.redirect("/login/login_email");

    // Goodbye!
    return;
  }

  // We use a try and catch loop in case anything fails, that way it doesn't crash the server
  try {
    // Connect to database
    await client.connect();

    // This is the database
    // The way mongodb works, you have a cluster, then inside that cluster, multiple databases,
    // then in a database, multiple collections which is where you store data.
    // Cluster -> Database -> Collection -> Data
    // This was written by MrMe, not chatgpt btw
    // you can tell by the way i capitalize sentences

    const database = client.db("auth");
    const collection = database.collection("users");

    // Hash for security, also uses a secret
    const username = hash(req.body.username);
    const password = hash(req.body.password);

    // Try to find user
    const user = await collection.findOne({
      username: username,
      password: password,
    });

    // Doesn't exist: go to register
    if (!user) {
      res.redirect("/register");
    } else {
      // Add session token
      req.session.loggedIn = true;
      res.redirect("/");
    }
  } catch (e) {
    // 500 handling
    console.log(e);
    next(500);
    res.send(e);
  } finally {
    await client.close();
  }
});

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

app.get("practice", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "challenges.html"));
});
// Handle 404
app.use((req, res, next) => {
  next(404);
});

// Finally built this, yay!

app.use((err, req, res, next) => {
  const status = err || 500;
  const page = `
  <!DOCTYPE html>
  <html>
  <head>
    <link
      rel="icon"
      href="https://cdn.glitch.global/8a69a447-95b2-456d-95af-9d3addfebea8/favicon.ico?v=1720468815926"
    />
    <title>Oh no! ${status}!</title>
  </head>
  <body>
    <img src="https://http.cat/${status}" />
  </body>
</html>
  `;
  res.status(status);
  res.send(page);
});

// Go Go Go!
app.listen(process.env.PORT, () => {
  console.log(`Server is up!`);
});
