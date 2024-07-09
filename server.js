// Used for hosting
const express = require("express");
const app = express();

// General Utility
const path = require("path");
var bodyParser = require("body-parser");

// Authentication and Security
const sanitize = require("mongo-sanitize");
const { createHash } = require("crypto");

// Configurate the database connection
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://" +
  process.env.DATABASE_USERNAME +
  ":" +
  process.env.DATABASE_PASSWORD +
  "@radiata.0g6mder.mongodb.net/?retryWrites=true&w=majority&appName=radiata";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(function (req, res, next) {
  res.setHeader("X-Powered-By", process.env.FLAG_POWERED_BY);
  next();
});

// Anything in this folder is being served
app.use(express.static(path.join(__dirname, "public")));

// Parse request body
app.use(bodyParser.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/register", async (req, res) => {
  if (
    !(req.body.username && req.body.password && req.body.name && req.body.email)
  ) {
    res.redirect("/register");
    return;
  }
  try {
    await client.connect();

    const database = client.db("auth");
    const collection = database.collection("users");
    const username = createHash("sha256")
      .update(sanitize(req.body.username))
      .digest("base64");
    const password = createHash("sha256")
      .update(sanitize(req.body.password))
      .digest("base64");
    const email = createHash("sha256")
      .update(sanitize(req.body.email))
      .digest("base64");
    const name = createHash("sha256")
      .update(sanitize(req.body.name))
      .digest("base64");

    const exists = await collection.findOne({
      $or: [{ username }, { email }],
    });
    
    if (exists) {
      res.send("Username or Email already exists!")
      return;
    }
    await collection.insertone({
      username: username,
      password: password,
      email: email,
      name: name
    })
  } catch (e) {
    res.send(e);
  } finally {
    await client.close();
  }
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", async (req, res) => {
  // User did not supply username and/or password
  if (!(req.body.username && req.body.password)) {
    console.log("username/password missing");

    // Send them back to login!
    res.redirect("/login");

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
    const username = createHash("sha256")
      .update(sanitize(req.body.username))
      .digest("base64");
    const password = createHash("sha256")
      .update(sanitize(req.body.password))
      .digest("base64");

    const user = await collection.findOne({
      username: username,
      password: password,
    });
    if (!user) {
      res.redirect("/register");
    } else {
      res.send("Hey, welcome back!");
    }
  } catch (e) {
    console.log(e);
    res.send(e);
  } finally {
    await client.close();
  }
});
app.listen(process.env.PORT, () => {
  console.log(`Server is up!`);
});
