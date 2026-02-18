const mongoose = require('mongoose');
const { Product } = require('./src/models');
require('dotenv').config();

const sampleProducts = [
    {
        title: 'EFV™ VOL 1: The Origin Code (E-Book)',
        type: 'EBOOK',
        price: 299,
        filePath: 'ebooks/EFV App & Tech Work Checklist.pdf',
        thumbnail: '/img/vol1-cover.png'
    },
    {
        title: 'EFV™ Audio Guide: Energy Mastery',
        type: 'AUDIOBOOK',
        price: 199,
        filePath: 'audiobooks/WhatsApp Audio 2026-02-13 at 12.20.47 PM.mpeg',
        thumbnail: '/img/audio-cover.png'
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/efv_marketplace');
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert sample products
        const products = await Product.insertMany(sampleProducts);
        console.log(`Inserted ${products.length} demo products:`);
        products.forEach(p => console.log(`  - ${p.title} (${p.type})`));

        mongoose.connection.close();
        console.log('\n✅ Database seeded successfully!');
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
