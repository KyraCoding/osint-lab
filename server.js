const express=  require('express');
const app = express();


app.get('/', (req, res) => {
  res.sendFile("/app/index.html")
})

app.get('/login', (req, res) => {
  console.log(`Username: ${req.query.username} Password: ${req.query.password}`)
  if (req.query.username === "admin" && req.query.password === "test1234") {
    res.send("Hello admin!")
  } else {
    res.send("WRONG PASSWORD HAHAHA")
  }
});
app.listen(process.env.PORT, () => {
  console.log(`Server is up!`)
})