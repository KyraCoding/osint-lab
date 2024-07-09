// Used for hosting
const express = require("express");
const app = express();

// General Utility
const path = require("path");

// Authentication and Security
const sanitize = require("mongo-sanitize");
const {createHash} = require("crypto");

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
  res.setHeader('X-Powered-By', process.env.FLAG_POWERED_BY)
  next()
})

// Anything in this folder is being served
app.use(express.static(path.join(__dirname, "public")));




app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"))
})

app.get("/auth", async (req, res) => {
  if (!req.query.username || !req.query.password) {
    res.redirect("/login")
  }
  try {
    await client.connect();
    
    const database = client.db("auth");
    const collection = database.collection("users");
    const username = createHash('sha256').update(sanitize(req.query.username)).digest('base64');
    const password = createHash('sha256').update(sanitize(req.query.password)).digest('base64');

    const user = await collection.findOne({
      username: username,
      password: password,
    });
    if (!user) {
      const result = await collection.insertOne({
        username: username,
        password: password,
      });
      res.send("New user! Added you!");
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
