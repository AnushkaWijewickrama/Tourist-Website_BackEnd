// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.split(" ");
    if (!token[1]) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token[1], process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken;