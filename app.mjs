// app.mjs (or app.js with "type": "module")
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Hello World from Render <a href="/barry">barry</a>')
})

// endpoints ... middlewares ... apis?
// send an html file

app.get('/barry', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'barry.html')) 
})

//app.listen(3000)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
