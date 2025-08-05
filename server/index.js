const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authenticate = require('./routes/auth');
const Moods = require('./routes/moods');
const Users = require('./routes/user');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Adjust to your frontend URL
    credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Mood Tracker is up and running!', data: null });
});

// --- SIGNUP ---
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Fast fail validation
        if (!username || typeof username !== 'string' || username.length < 3) {
            return res.status(400).json({ success: false, error: 'Username must be at least 3 characters long' });
        }
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
        }

        // Call service layer
        const result = await Users.createUser({ username, email, password });

        if (!result.success) {
            return res.status(400).json(result);
        }

        const token = jwt.sign(
            { user_id: result.data.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            success: true,
            message: result.message,
            token,
            data: result.data
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fast fail validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string' || password.length === 0) {
            return res.status(400).json({ success: false, error: 'Password is required' });
        }

        // Call service layer
        const result = await Users.verifyUser(email, password);

        if (!result.success) {
            return res.status(400).json(result);
        }

        const token = jwt.sign(
            { user_id: result.data.user_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: result.message,
            token,
            data: result.data
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- CREATE MOOD ENTRY ---
app.post('/create-mood-entry', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { mood, mood_rating } = req.body;

        // Fast fail validation
        if (!mood || typeof mood !== 'string' || mood.trim() === '') {
            return res.status(400).json({ success: false, error: 'Mood is required and must be a non-empty string' });
        }
        if (!Number.isInteger(mood_rating) || mood_rating < 1 || mood_rating > 10) {
            return res.status(400).json({ success: false, error: 'Mood rating must be an integer between 1 and 10' });
        }

        // Call service layer
        const result = await Moods.createMoodEntry(userId, req.body);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- GET MOOD HISTORY WITH OPTIONAL FILTERS ---
app.get('/mood-history', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const filters = req.query; // Pass all query params to service

        const result = await Moods.getMoodEntriesByUserId(userId, filters);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// --- GET MOOD HISTORY WITH OPTIONAL FILTERS ---
app.get('/mood-history', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const filters = req.query; // Pass all query params to service

        const result = await Moods.getMoodEntriesByUserId(userId, filters);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- UPDATE MOOD ENTRY ---
app.put('/update-mood-entry/:entryId', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const entryId = parseInt(req.params.entryId);

        if (!Number.isInteger(entryId)) {
            return res.status(400).json({ success: false, error: 'Invalid entry ID' });
        }

        const result = await Moods.updateMoodEntry(userId, entryId, req.body);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- DELETE MOOD ENTRY ---
app.delete('/delete-mood-entry/:entryId', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const entryId = parseInt(req.params.entryId);

        if (!Number.isInteger(entryId)) {
            return res.status(400).json({ success: false, error: 'Invalid entry ID' });
        }

        const result = await Moods.deleteMoodEntry(userId, entryId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


/* 
You can  run Postman tests like:

GET /mood-history?from=2025-08-01

GET /mood-history?from=2025-08-01&to=2025-08-05

GET /mood-history?rating=8

GET /mood-history?mood=happy

Combined: GET /mood-history?from=2025-08-01&rating=7&mood=stressed

*/ 
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
