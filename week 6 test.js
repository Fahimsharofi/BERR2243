require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = { ...req.body, password: hashedPassword };
        await db.collection('users').insertOne(user);
        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(400).json({ error: "Registration failed" });
    }
});

app.post('/auth/login', async (req, res) => {
    const user = await db.collection('users').findOne({ email: req.body.email });
    
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).json({ token });
});

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
    
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: "Forbidden" });
    next();
};

module.exports = { authenticate, authorize };

const { authenticate, authorize } = require('./middleware/auth');

app.delete('/admin/users/:id', authenticate, authorize(['admin']), async (req, res) => {
    await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json({ message: "User deleted" });
});