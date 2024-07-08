const express=  require('express');
const app = express();


app.get('/', (req, res) => {
  res.sendFile("/app/index.html")
})

app.get('/login', (req, res) => {
  console.log(`Username: ${req.params.username} Password: ${req.params.password}`)
  if (req.params.username === "admin" && req.params.password === "test1234") {
    req.send("Hello admin!")
  } else {
    req.send("WRONG PASSWORD HAHAHA")
  }
});
app.listen(process.env.PORT, () => {
  console.log(`Server is up!`)
})