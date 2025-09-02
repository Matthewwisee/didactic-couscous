// app.mjs (or app.js with "type": "module")
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World from Render <a href="/barry">barry</a>')
})

// endpoints ... middlewares ... apis?
// send an html file

app.get('/barry', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'barry.html')) 
})

app.get('/api/barry', (req, res) => {
  // res.send('barry. <a href="/">home</a>')
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

//app.listen(3000)

app.get('/api/query', (req, res) => {

  //console.log('Client request with query param:', req.query.name);
  const name = req.query.name;
  res.json({
    "message": name
  })
})

app.get('/api/url/:id', (req, res) => {
  console.log('Client request with url param:', req.params.id);
})

app.post('/api/body', (req, res) => {

  console.log('Client request with POST name:', req.body.name);
  console.log('Client request with POST zip:', req.body.zip);

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
