const fs = require('fs');
const path = require('path');

/**
 * Getting a stream for a private file.
 * In production, this would interface with AWS S3 or similar.
 */
const getFileStream = (filePath) => {
    // SECURITY: Ensure the path is within the designated private-storage folder
    // to prevent directory traversal attacks.
    const privateStore = path.join(__dirname, '../../private-storage');
    const fullPath = path.resolve(privateStore, filePath);

    if (!fullPath.startsWith(path.resolve(privateStore))) {
        throw new Error('Unauthorized storage access attempt');
    }

    if (!fs.existsSync(fullPath)) {
        throw new Error('Content file not found');
    }

    return fs.createReadStream(fullPath);
};

module.exports = { getFileStream };
