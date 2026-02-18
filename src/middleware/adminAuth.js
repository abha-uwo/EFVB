const jwt = require('jsonwebtoken');
const { User } = require('../models');

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No admin token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

        const admin = await User.findOne({ _id: decoded.id, role: 'admin' });

        if (!admin) {
            return res.status(403).json({ message: 'Access denied: Admin rights required' });
        }

        req.user = admin; // For consistency with standard protect middleware
        req.admin = admin; // For backwards compatibility
        next();
    } catch (error) {
        console.error('Admin Auth Error:', error);
        res.status(401).json({ message: 'Invalid or expired admin token' });
    }
};

module.exports = adminAuth;
