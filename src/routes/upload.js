const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminAuth = require('../middleware/adminAuth');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'cover') {
            cb(null, 'src/uploads/covers');
        } else if (file.fieldname === 'ebook') {
            cb(null, 'src/uploads/ebooks');
        } else if (file.fieldname === 'audio') {
            cb(null, 'src/uploads/audiobooks');
        } else {
            cb({ message: 'Invalid field name' }, false);
        }
    },
    filename: function (req, file, cb) {
        // Sanitize filename and timestamp it
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|mp3|mpeg/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Invalid file type!');
        }
    }
});

// Upload route
router.post('/', adminAuth, upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'ebook', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), (req, res) => {
    try {
        const files = req.files;
        const responseIds = {};

        if (files.cover) responseIds.coverPath = files.cover[0].path;
        if (files.ebook) responseIds.ebookPath = files.ebook[0].path;
        if (files.audio) responseIds.audioPath = files.audio[0].path;

        res.json({
            message: 'Files uploaded successfully',
            paths: responseIds
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'File upload failed' });
    }
});

module.exports = router;
