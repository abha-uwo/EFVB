const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const { Product } = require('./src/models');

// Load env vars from parent directory
dotenv.config({ path: path.join(__dirname, '.env') });

const initialProducts = [
    {
        _id: new mongoose.Types.ObjectId('65cc7f1e7b4e2b001f1a2b01'),
        title: 'EFV™ VOL 1: The Origin Code (Audiobook)',
        type: 'AUDIOBOOK',
        price: 199,
        filePath: 'audiobooks/efv-audio.mp3',
        description: 'The standard audiobook version of Volume 1.'
    },
    {
        _id: new mongoose.Types.ObjectId('65cc7f1e7b4e2b001f1a2b02'),
        title: 'EFV™ VOL 1: The Origin Code (E-Book)',
        type: 'EBOOK',
        price: 149,
        filePath: 'ebooks/efv-checklist.pdf',
        description: 'The standard e-book version of Volume 1.'
    }
];

const seedProducts = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for seeding...');

        for (const productData of initialProducts) {
            const exists = await Product.findOne({ title: productData.title });
            if (!exists) {
                await Product.create(productData);
                console.log(`✅ Seeded: ${productData.title}`);
            } else {
                console.log(`⚠️ Already exists: ${productData.title}`);
            }
        }

        console.log('✨ Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedProducts();
