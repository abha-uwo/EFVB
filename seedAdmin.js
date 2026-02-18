const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

// Load env vars from parent directory
dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for admin seeding...');

        const email = 'admin@uwo24.com';
        const password = 'uwo@1234';

        const exists = await User.findOne({ email });
        if (exists) {
            console.log('⚠️ Admin already exists.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name: 'Super Admin',
            email: email,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Admin seeding failed:', error);
        process.exit(1);
    }
};

seedAdmin();
