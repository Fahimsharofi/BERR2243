const express = require('express');
const app = express();
app.use(express.json());

let rides = [];

// Get all rides
app.get('/rides', (req, res) => {
    res.json(rides);
});

// Create a new ride
app.post('/rides', (req, res) => {
    const ride = {
        id: Date.now(), // simple unique ID
        driver: req.body.driver,
        destination: req.body.destination,
        status: req.body.status || 'pending'
    };
    rides.push(ride);
    res.status(201).json(ride);
});

// Update a ride
app.put('/rides/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const ride = rides.find(r => r.id === id);

    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }

    Object.assign(ride, req.body);
    res.json({ updated: true, ride });
});

// Delete a ride
app.delete('/rides/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = rides.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Ride not found' });
    }

    rides.splice(index, 1);
    res.json({ deleted: true });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

// Register user
app.post('/users', (req, res) => {
    const user = req.body;
    if (!user.username || !user.password) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    res.status(201).json({ message: 'User created', user });
});

// Login user
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'test' && password === '1234') {
        return res.status(200).json({ message: 'Login successful' });
    }
    res.status(401).json({ error: 'Unauthorized' });
});

// Update driver status
app.patch('/drivers/:id/status', (req, res) => {
    const { id } = req.params;
    const { available } = req.body;
    if (id === '1') {
        return res.json({ updated: true, driverId: id, available });
    }
    res.status(404).json({ error: 'Driver not found' });
});

// Block user (Admin)
app.delete('/admin/users/:id', (req, res) => {
    const { id } = req.params;
    if (id === '1') {
        return res.status(204).send();
    }
    res.status(403).json({ error: 'Permission denied' });
});