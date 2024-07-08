import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
const app = express();

const port = process.env.PORT
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "osint-monkey.firebaseapp.com",
  projectId: "osint-monkey",
  storageBucket: "osint-monkey.appspot.com",
  messagingSenderId: "997384016586",
  appId: "1:997384016586:web:0313ecbbd83dc6fd2dda33",
  measurementId: "G-P8FW4RVM20"
};
initializeApp(firebaseConfig);


app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

app.listen(port, () => {
  console.log(`Server is up!`)
})