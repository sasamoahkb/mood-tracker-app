const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const authenticate = require('./routes/auth');
const Moods = require('./routes/moods');
const Users = require('./routes/user');
const jwt = require('jsonwebtoken');


const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your frontend URL
    credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Mood Tracker is up and running!');
});

// --- SIGNUP ---
app.post('/signup', async (req, res) => {
    try { 
        // Validate inputs
        const { username, email, password } = req.body;
        if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        if (!username || username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }
        const result = await Users.createUser({ username, email, password });
        if (!result.success) return res.status(400).json({ error: result.error });

        // Issue JWT
        const token = jwt.sign(
            { user_id: result.data.user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' });
        res.json({ token, user: result.data });
    
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
    try { 
        const { email, password } = req.body;
        if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const result = await Users.verifyUser(email, password);
        if (!result.success) return res.status(400).json({ error: result.error });

        const token = jwt.sign(
            { user_id: result.data.user_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' });
        res.json({ token, user: result.data });
    } catch (err) {
        res.status(500).json({ error: err.message })};
});

// Mood routes
app.post('/create-mood-entry', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id; // Get user ID from auth middleware
        const data = req.body;
        
        const moods = await Moods.createMoodEntry(userId, data);
        if (!moods.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json(moods.data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});