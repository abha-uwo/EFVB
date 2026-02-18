const mongoose = require('mongoose');

if (process.env.USE_JSON_DB === 'true') {
    module.exports = require('./jsonAdapter');
    return;
}

// Updated User Schema with profile details
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: String,
    savedAddresses: [{
        label: String, // e.g., "Home", "Office"
        address: String,
        city: String,
        zip: String,
        country: String
    }],
    paymentMethods: [{
        type: { type: String, default: 'card' },
        last4: String,
        brand: String
    }],
    createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['EBOOK', 'AUDIOBOOK', 'PAPERBACK', 'HARDCOVER'], required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    filePath: { type: String }, // Optional for physical books
    thumbnail: String,
    category: String,
    description: String,
    volume: String // e.g. "1", "2"
});

// New Cart Schema
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        addedAt: { type: Date, default: Date.now }
    }],
    updatedAt: { type: Date, default: Date.now }
});

// New Digital Library Schema
const digitalLibrarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        type: String, // EBOOK or AUDIOBOOK
        thumbnail: String,
        filePath: String,
        purchasedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 }, // For reading/listening progress
        lastAccessed: { type: Date, default: Date.now }
    }]
});

const purchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    transactionId: String,
    purchaseDate: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Linked to User
    customer: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        zip: String
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        price: Number,
        quantity: Number,
        type: String
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'COD' },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Failed'],
        default: 'Pending'
    },
    paymentStatus: { type: String, default: 'Pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    invoicePath: String, // Path to generated PDF invoice
    timeline: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }],
    createdAt: { type: Date, default: Date.now }
});

const userProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['EBOOK', 'AUDIOBOOK'], required: true },
    progress: { type: Number, default: 0 }, // 0-100 percentage

    // Audio Specific
    currentTime: { type: Number, default: 0 }, // Seconds
    totalDuration: { type: Number, default: 0 },

    // E-book Specific
    lastPage: { type: Number, default: 1 },
    totalPages: { type: Number, default: 0 },
    scrollPosition: { type: Number, default: 0 },

    lastUpdated: { type: Date, default: Date.now }
});

userProgressSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = {
    User: mongoose.model('User', userSchema),
    Product: mongoose.model('Product', productSchema),
    Purchase: mongoose.model('Purchase', purchaseSchema),
    Order: mongoose.model('Order', orderSchema),
    Cart: mongoose.model('Cart', cartSchema),
    DigitalLibrary: mongoose.model('DigitalLibrary', digitalLibrarySchema),
    UserProgress: mongoose.model('UserProgress', userProgressSchema)
};
