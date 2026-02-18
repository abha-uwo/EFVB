const dotenv = require('dotenv');
const path = require('path');
// Load environment variables
dotenv.config();

const { UserProgress } = require('./src/models');

console.log('Testing UserProgress persistence...');
console.log('USE_JSON_DB raw:', process.env.USE_JSON_DB);
console.log('USE_JSON_DB type:', typeof process.env.USE_JSON_DB);
console.log('Is "true"?', process.env.USE_JSON_DB === 'true');
console.log('Is "true " (with space)?', process.env.USE_JSON_DB === 'true ');

async function testSave() {
    try {
        const userId = 'test_user_123';
        const productId = 'test_product_456';
        const progress = 5;
        const total = 100;

        console.log(`Attempting to save progress: Page ${progress}/${total}`);

        const updatedProgress = await UserProgress.findOneAndUpdate(
            { userId, productId },
            { progress, total, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );

        console.log('Result:', updatedProgress);

        // Check file content?
        const fs = require('fs');
        const dbPath = path.join(__dirname, 'src/data/progress.json');
        if (fs.existsSync(dbPath)) {
            const content = fs.readFileSync(dbPath, 'utf8');
            console.log('File Content:', content);
        } else {
            console.log('File does not exist!');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSave();
