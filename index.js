const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
<<<<<<< HEAD

const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017';

app.use(express.json());

async function startServer() {
=======
const port = 3000;

const app = express();
app.use(express.json());

let db;

async function connectToMongoDB() {
    const uri = "mongodb://localhost:27017";
>>>>>>> fa28d097bd57c68036be5dea0438a3e5c00ef6db
    const client = new MongoClient(uri);

    try {
        await client.connect();
<<<<<<< HEAD
        console.log('Connected to MongoDB');

        const db = client.db('testDB');
        const ridesCollection = db.collection('rides');

        // Routes go here (after DB is ready)

        // Create a new ride
        app.post('/rides', async (req, res) => {
            try {
                const result = await ridesCollection.insertOne(req.body);
                res.status(201).json({ id: result.insertedId });
            } catch (err) {
                res.status(400).json({ error: 'Invalid ride data' });
            }
        });

        // Get all rides
        app.get('/rides', async (req, res) => {
            try {
                const rides = await ridesCollection.find().toArray();
                res.status(200).json(rides);
            } catch (err) {
                res.status(500).json({ error: 'Failed to fetch rides' });
            }
        });

        // Update a ride
        app.patch('/rides/:id', async (req, res) => {
            try {
                const result = await ridesCollection.updateOne(
=======
        console.log("Connected to MongoDB");

        db = client.db("testDB");

        // ✅ Define routes after DB connection is established

        // GET /rides - Fetch all rides
        app.get('/rides', async (req, res) => {
            try {
                const rides = await db.collection('rides').find().toArray();
                res.status(200).json(rides);
            } catch (err) {
                res.status(500).json({ error: "Failed to fetch rides" });
            }
        });

        // POST /rides - Create a new ride
        app.post('/rides', async (req, res) => {
            try {
                const result = await db.collection('rides').insertOne(req.body);
                res.status(201).json({ id: result.insertedId });
            } catch (err) {
                res.status(400).json({ error: "Invalid ride data" });
            }
        });

        // PATCH /rides/:id - Update ride status
        app.patch('/rides/:id', async (req, res) => {
            try {
                const result = await db.collection('rides').updateOne(
>>>>>>> fa28d097bd57c68036be5dea0438a3e5c00ef6db
                    { _id: new ObjectId(req.params.id) },
                    { $set: { status: req.body.status } }
                );

                if (result.modifiedCount === 0) {
<<<<<<< HEAD
                    return res.status(404).json({ error: 'Ride not found' });
                }
                res.status(200).json({ updated: result.modifiedCount });
            } catch (err) {
                res.status(400).json({ error: 'Invalid ride ID or data' });
            }
        });

        // Delete a ride
        app.delete('/rides/:id', async (req, res) => {
            try {
                const result = await ridesCollection.deleteOne(
=======
                    return res.status(404).json({ error: "Ride not found" });
                }
                res.status(200).json({ updated: result.modifiedCount });

            } catch (err) {
                res.status(400).json({ error: "Invalid ride ID or data" });
            }
        });

        // DELETE /rides/:id - Cancel a ride
        app.delete('/rides/:id', async (req, res) => {
            try {
                const result = await db.collection('rides').deleteOne(
>>>>>>> fa28d097bd57c68036be5dea0438a3e5c00ef6db
                    { _id: new ObjectId(req.params.id) }
                );

                if (result.deletedCount === 0) {
<<<<<<< HEAD
                    return res.status(404).json({ error: 'Ride not found' });
                }
                res.status(200).json({ deleted: result.deletedCount });
            } catch (err) {
                res.status(400).json({ error: 'Invalid ride ID' });
            }
        });

        // Start the server only after DB connection and routes
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}

startServer();
=======
                    return res.status(404).json({ error: "Ride not found" });
                }
                res.status(200).json({ deleted: result.deletedCount });

            } catch (err) {
                res.status(400).json({ error: "Invalid ride ID" });
            }
        });

        // ✅ Start server only after DB is ready
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (err) {
        console.error("Error:", err);
    }
}

connectToMongoDB();
>>>>>>> fa28d097bd57c68036be5dea0438a3e5c00ef6db

