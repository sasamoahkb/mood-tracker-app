const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authenticate = require('./routes/auth');
const Moods = require('./routes/moods');
const Users = require('./routes/user');
const jwt = require('jsonwebtoken');
const Journals = require('./routes/journals'); // adjust path
const Factors = require('./routes/factors'); // adjust path
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs   
    message: {error: 'Too many requests, please try again later.'},
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const app = express();

// Apply rate limiting to authentication routes
app.use('/login', authLimiter);
app.use('/signup', authLimiter);

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

// --- GET MOOD HISTORY WITH OPTIONAL FILTERS & PAGINATION ---
app.get('/mood-history', authenticate, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Extract all query parameters from the request
        // These can include from, to, rating, mood, page, limit
        const filters = {
            from: req.query.from || null,
            to: req.query.to || null,
            rating: req.query.rating || null,
            mood: req.query.mood || null,
            page: parseInt(req.query.page) || 1, // Default page = 1
            limit: parseInt(req.query.limit) || 10 // Default limit = 10 results per page
        };

        // Fetch mood entries from the database using the filters
        const result = await Moods.getMoodEntriesByUserId(userId, filters);

        // If something went wrong, send error
        if (!result.success) {
            return res.status(400).json(result);
        }

        // Success → send paginated results + metadata
        res.json(result);

    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: err.message || 'Server error while fetching mood history'
        });
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

// CREATE journal entry
app.post('/create-journal-entry', authenticate, async (req, res) => {
    const { entry_id, content } = req.body;
    const userId = req.user.user_id;

    const result = await Journals.createJournalEntry(userId, entry_id, content);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// GET journal history
app.get('/journal-history', authenticate, async (req, res) => {
    try{
        const { from, to } = req.query;
        const userId = req.user.user_id;
        const result = await Journals.getJournalEntries(userId, { from, to });
        
        if (!result.success) return res.status(400).json(result);
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// UPDATE journal entry
app.put('/update-journal-entry/:journalId', authenticate, async (req, res) => {
    const { journalId } = req.params;
    const { content } = req.body;
    const userId = req.user.user_id;

    const result = await Journals.updateJournalEntry(userId, parseInt(journalId), content);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// DELETE journal entry
app.delete('/delete-journal-entry/:journalId', authenticate, async (req, res) => {
    const { journalId } = req.params;
    const userId = req.user.user_id;

    const result = await Journals.deleteJournalEntry(userId, parseInt(journalId));
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// GET all factors (public)
app.get('/factors', async (req, res) => {
    const result = await Factors.getAllFactors();
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// CREATE factor (protected)
app.post('/factors', authenticate, async (req, res) => {
    const result = await Factors.createFactor(req.body);
    if (!result.success) return res.status(400).json(result);
    res.status(201).json(result);
});

// UPDATE factor (protected)
app.put('/factors/:id', authenticate, async (req, res) => {
    const factorId = parseInt(req.params.id, 10);
    const result = await Factors.updateFactor(factorId, req.body);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// DELETE factor (protected)
app.delete('/factors/:id', authenticate, async (req, res) => {
    const factorId = parseInt(req.params.id, 10);
    const result = await Factors.deleteFactor(factorId);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

/* 
You can  run Postman tests like:

GET /mood-history?from=2025-08-01

GET /mood-history?from=2025-08-01&to=2025-08-05

GET /mood-history?rating=8

GET /mood-history?mood=happy

Combined: GET /mood-history?from=2025-08-01&rating=7&mood=stressed

*/ 