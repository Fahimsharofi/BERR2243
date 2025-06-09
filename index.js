const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017';

app.use(express.json());

async function startServer() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
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
                    { _id: new ObjectId(req.params.id) },
                    { $set: { status: req.body.status } }
                );

                if (result.modifiedCount === 0) {
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
                    { _id: new ObjectId(req.params.id) }
                );

                if (result.deletedCount === 0) {
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
