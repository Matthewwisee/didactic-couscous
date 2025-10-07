import 'dotenv/config'
import { connectDB, getDB } from './db/mongo.mjs'
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ObjectId } from 'mongodb';

const app = express()
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));
app.use('/scripts', express.static(join(__dirname, 'scripts')));
app.use(express.json());

// Call function from db/mongo.mjs
connectDB()

// ROUTES
app.get('/', (req, res) => {
  res.redirect('/guitars');
});

app.get('/guitars', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'guitars.html'));
});

// CREATE - Add a new guitar
app.post('/api/guitars', async (req, res) => {
  try {
    const db = getDB();
    const { name, price, color } = req.body;

    // Simple validation
    if (!name || !price || !color) {
      return res.status(400).json({ error: 'Name, price, and color are required' });
    }

    const guitar = { name, price: parseInt(price), color };
    const result = await db.collection('guitars').insertOne(guitar);

    res.status(201).json({
      message: 'Guitar created successfully',
      guitarId: result.insertedId,
      guitar: { ...guitar, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create guitar: ' + error.message });
  }
});

// READ - Get all guitars
app.get('/api/guitars', async (req, res) => {
  try {
    const db = getDB();
    const guitars = await db.collection('guitars').find({}).toArray();
    res.json(guitars); // Return just the array for frontend simplicity
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guitars: ' + error.message });
  }
});

// UPDATE - Update a guitar by ID
app.put('/api/guitars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, color } = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid guitar ID' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (price) updateData.price = parseInt(price);
    if (color) updateData.color = color;

    const db = getDB();
    const result = await db.collection('guitars').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Guitar not found' });
    }

    res.json({
      message: 'Guitar updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update guitar: ' + error.message });
  }
});

// DELETE - Delete a guitar by ID
app.delete('/api/guitars/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid guitar ID' });
    }

    const db = getDB();
    const result = await db.collection('guitars').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Guitar not found' });
    }

    res.json({
      message: 'Guitar deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete guitar: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})