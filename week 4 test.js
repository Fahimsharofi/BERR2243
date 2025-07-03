const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = "mongodb+srv://fahimsharofi:fahim221204>@cluster0.mongodb.net/rideHailingDB?retryWrites=true&w=majority"
const client = new MongoClient(uri);
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db('rideHailingDB');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}
connectDB();

// Routes

// POST - Create new ride
app.post('/rides', async (req, res) => {
  try {
    // Input validation
    if (!req.body.pickupLocation || !req.body.destination) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ride = {
      ...req.body,
      status: 'requested',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('rides').insertOne(ride);
    res.status(201).json({ 
      id: result.insertedId,
      message: "Ride created successfully" 
    });
    
  } catch (err) {
    res.status(500).json({ error: "Failed to create ride" });
  }
});

// GET - All rides
app.get('/rides', async (req, res) => {
  try {
    const rides = await db.collection('rides').find().toArray();
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rides" });
  }
});

// GET - Single ride
app.get('/rides/:id', async (req, res) => {
  try {
    const ride = await db.collection('rides').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }
    
    res.status(200).json(ride);
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// PATCH - Update ride status
app.patch('/rides/:id', async (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status: req.body.status,
          updatedAt: new Date() 
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Ride not found or no changes made" });
    }

    res.status(200).json({ 
      updated: result.modifiedCount,
      message: "Ride status updated" 
    });
    
  } catch (err) {
    res.status(400).json({ error: "Invalid update data" });
  }
});

// DELETE - Remove ride
app.delete('/rides/:id', async (req, res) => {
  try {
    const result = await db.collection('rides').deleteOne(
      { _id: new ObjectId(req.params.id) }
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Ride not found" });
    }

    res.status(200).json({ 
      deleted: result.deletedCount,
      message: "Ride deleted successfully" 
    });
    
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});