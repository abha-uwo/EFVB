const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { User, Purchase, Product, UserProgress } = require('../models');

// Get user's digital library
router.get('/my-library', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('library');

        let library = user ? user.library : [];

        // Fallback: If library is empty, sync from purchases
        if (library.length === 0) {
            const purchases = await Purchase.find({ userId: req.user._id }).populate('productId');
            library = purchases.map(p => p.productId).filter(p => p != null);

            // Auto-update user's library if found
            if (library.length > 0 && user) {
                user.library = library.map(p => p._id);
                await user.save();
            }
        }

        res.json(library);
    } catch (error) {
        console.error('Error fetching library:', error);
        res.status(500).json({ message: 'Error fetching library' });
    }
});

// Save Progress
router.post('/progress', protect, async (req, res) => {
    try {
        const { productId, progress, total } = req.body;
        const userId = req.user._id;

        const updatedProgress = await UserProgress.findOneAndUpdate(
            { userId, productId },
            { progress, total, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );

        res.json(updatedProgress);
    } catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({ message: 'Error saving progress' });
    }
});

// Get Progress
router.get('/progress/:productId', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.productId;

        const progress = await UserProgress.findOne({ userId, productId });

        res.json(progress || { progress: 0, total: 0 });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ message: 'Error fetching progress' });
    }
});

module.exports = router;
