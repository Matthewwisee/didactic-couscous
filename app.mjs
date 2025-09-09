// app.mjs (or app.js with "type": "module")
import 'dotenv/config'
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


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
