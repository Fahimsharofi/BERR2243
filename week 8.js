const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

// Load environment variables
dotenv.config();

// Middleware to parse JSON
app.use(express.json());

// Simulated in-memory "database" for demo purposes
const db = {
  users: [],
};

// Middleware for authentication (JWT verification)
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
    req.user = decoded; // Store decoded user info in request
    next(); // Proceed to the next middleware/route
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware for authorization (role check)
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next(); // Proceed if user has the right role
};

// 1. Registration Endpoint
app.post('/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = db.users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const user = { email, password: hashedPassword, role };

    // Store the user (simulating database insert)
    db.users.push(user);

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// 2. Login Endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = db.users.find((u) => u.email === email);

  // Check if user exists and if password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create a JWT token
  const token = jwt.sign(
    { userId: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Token expires in 1 hour
  );

  res.status(200).json({ token });
});

// 3. Admin Endpoint (Protected)
app.delete('/admin/users/:id', authenticate, authorize(['admin']), async (req, res) => {
  const userId = req.params.id;

  // Find user to delete
  const userIndex = db.users.findIndex((u) => u.email === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Remove user from the database
  db.users.splice(userIndex, 1);

  res.status(200).json({ message: 'User deleted' });
});

// 4. Protected Route for Drivers and Admins
app.get('/protected', authenticate, authorize(['admin', 'driver']), (req, res) => {
  res.status(200).json({ message: 'Access granted to driver or admin.' });
});

// 5. Sample User Creation for Testing (Preload)
app.post('/create-sample', async (req, res) => {
  const sampleUsers = [
    { email: 'admin@example.com', password: 'securePassword123', role: 'admin' },
    { email: 'driver@example.com', password: 'securePassword123', role: 'driver' },
    { email: 'customer@example.com', password: 'securePassword123', role: 'customer' },
  ];

  for (const user of sampleUsers) {
    // Hash password for each user
    const hashedPassword = await bcrypt.hash(user.password, 10);
    db.users.push({ ...user, password: hashedPassword });
  }

  res.status(201).json({ message: 'Sample users created' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
