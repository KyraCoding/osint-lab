const express = require("express");
const app = express();
const path = require("path");
const sanitize = require("mongo-sanitize");
const crypto = require("crypto");


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

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", async (req, res) => {
  try {
    await client.connect();

    const database = client.db("auth");
    const collection = database.collection("users");
    const username = sanitize(req.query.username);
    const password = sanitize(req.query.password);

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
