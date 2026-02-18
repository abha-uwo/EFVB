const express = require('express');
const router = express.Router();
const { protect, validatePurchase } = require('../middleware/auth');
const { getFileStream } = require('../services/storage');
const { Product } = require('../models');

const fs = require('fs');
const path = require('path');

// Secure E-Book Streaming
router.get('/ebook/:productId', protect, validatePurchase, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product || product.type !== 'EBOOK') {
            return res.status(404).json({ message: 'E-Book not found' });
        }

        const privateStore = path.join(__dirname, '../../private-storage');
        const fullPath = path.resolve(privateStore, product.filePath);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ message: 'Content file not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        const stream = fs.createReadStream(fullPath);
        stream.pipe(res);
    } catch (error) {
        console.error('E-book streaming error:', error);
        res.status(500).json({ message: 'Error streaming E-book content' });
    }
});

// Secure Audiobook Streaming (Range-based for premium player experience)
router.get('/audio/:productId', protect, validatePurchase, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product || product.type !== 'AUDIOBOOK') {
            return res.status(404).json({ message: 'Audiobook not found' });
        }

        const privateStore = path.join(__dirname, '../../private-storage');
        const fullPath = path.resolve(privateStore, product.filePath);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ message: 'Audio file not found' });
        }

        const stat = fs.statSync(fullPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(fullPath, { start, end });

            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            };
            res.writeHead(200, head);
            fs.createReadStream(fullPath).pipe(res);
        }
    } catch (error) {
        console.error('Audio streaming error:', error);
        res.status(500).json({ message: 'Error streaming audio content' });
    }
});

module.exports = router;
