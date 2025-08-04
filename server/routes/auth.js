const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from header

    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token
        req.user = decoded; // Attach user info to the request
        next(); // Continue to the route handler
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
