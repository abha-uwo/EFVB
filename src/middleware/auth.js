const jwt = require('jsonwebtoken');
const { User, Purchase } = require('../models');

const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = await User.findById(decoded.id);
        if (req.user && req.user.password) delete req.user.password; // Manually remove password for safety
        if (!req.user) return res.status(404).json({ message: 'User not found' });
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized, token expired or invalid' });
    }
};

const validatePurchase = async (req, res, next) => {
    const { productId } = req.params;
    try {
        const purchase = await Purchase.findOne({
            userId: req.user._id,
            productId: productId
        });

        if (!purchase) {
            return res.status(403).json({ message: 'Access denied: Content not purchased' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error during validation' });
    }
};

module.exports = { protect, validatePurchase };
