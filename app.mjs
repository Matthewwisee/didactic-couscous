import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express()
const PORT = process.env.PORT || 3000; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));

app.use(express.json()); 

// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI; 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Keep the connection open for our CRUD operations
let db;
async function connectDB() {
  try {
    await client.connect();
    db = client.db("school"); // Database name
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
connectDB();




app.get('/', (req, res) => {
  res.send('Hello Express from Render 😍😍😍. <a href="barry">barry</a><br><a href="student-crud.html">📝 crud time!</a><br><a href="advanced-student-manager.html">🚀 Advanced CRUD!</a>')
})

// endpoints...middlewares...apis? 

// send an html file
app.get('/barry', (req, res) => {
 
  res.sendFile(join(__dirname, 'public', 'barry.html')) 

})

app.get('/api/barry', (req, res) => {
  // res.send('barry. <a href="/">home</a>')
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

app.get('/api/query', (req, res) => {

  //console.log("client request with query param:", req.query.name); 
  const name = req.query.name; 
  res.json({"message": `Hi, ${name}. How are you?`});

  // receivedData.queries.push(req.query.name || 'Guest');
  // const name = req.query.name || 'Guest';
  // res.json({ message: `Hello, ${name} (from query param)` });
});

app.get('/api/url/:iaddasfsd', (req, res) => {

  console.log("client request with URL param:", req.params.iaddasfsd); 
  // const name = req.query.name; 
  // res.json({"message": `Hi, ${name}. How are you?`});

});


app.get('/api/body', (req, res) => {

  console.log("client request with POST body:", req.query); 
  // const name = req.body.name; 
  // res.json({"message": `Hi, ${name}. How are you?`});

});

// CRUD ENDPOINTS FOR TEACHING
// Collection: students (documents with name, age, grade fields)

// CREATE - Add a new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, age, grade } = req.body;
    
    // Simple validation
    if (!name || !age || !grade) {
      return res.status(400).json({ error: 'Name, age, and grade are required' });
    }

    const student = { name, age: parseInt(age), grade };
    const result = await db.collection('students').insertOne(student);
    
    res.status(201).json({ 
      message: 'Student created successfully',
      studentId: result.insertedId,
      student: { ...student, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student: ' + error.message });
  }
});

// READ - Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await db.collection('students').find({}).toArray();
    res.json(students); // Return just the array for frontend simplicity
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students: ' + error.message });
  }
});

// UPDATE - Update a student by ID
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, grade } = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (age) updateData.age = parseInt(age);
    if (grade) updateData.grade = grade;

    const result = await db.collection('students').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      message: 'Student updated successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student: ' + error.message });
  }
});

// DELETE - Delete a student by ID
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const result = await db.collection('students').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ 
      message: 'Student deleted successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student: ' + error.message });
  }
});

// SEED - Add sample data for teaching
app.post('/api/seed', async (req, res) => {
  try {
    // First, clear existing data
    await db.collection('students').deleteMany({});
    
    // Sample students for teaching
    const sampleStudents = [
      { name: "Alice Johnson", age: 20, grade: "A" },
      { name: "Bob Smith", age: 19, grade: "B+" },
      { name: "Charlie Brown", age: 21, grade: "A-" },
      { name: "Diana Prince", age: 18, grade: "A+" },
      { name: "Edward Norton", age: 22, grade: "B" },
      { name: "Fiona Apple", age: 19, grade: "A" },
      { name: "George Wilson", age: 20, grade: "C+" },
      { name: "Hannah Montana", age: 18, grade: "B-" }
    ];

    const result = await db.collection('students').insertMany(sampleStudents);
    
    res.json({ 
      message: `Database seeded successfully! Added ${result.insertedCount} sample students.`,
      insertedCount: result.insertedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed database: ' + error.message });
  }
});

// CLEANUP - Remove all student data
app.delete('/api/cleanup', async (req, res) => {
  try {
    const result = await db.collection('students').deleteMany({});
    
    res.json({ 
      message: `Database cleaned successfully! Removed ${result.deletedCount} students.`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cleanup database: ' + error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})