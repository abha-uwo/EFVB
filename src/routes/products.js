const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const adminAuth = require('../middleware/adminAuth');

// Get all products (Public)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get single product (Public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// Create Product (Admin Only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const { title, price, type, filePath, description, thumbnail, stock, discount, category } = req.body;

        if (!title || !price || !type) {
            return res.status(400).json({ message: 'Title, Price, and Type are required' });
        }

        const product = await Product.create({
            title, price, type, filePath, description, thumbnail, stock, discount, category
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product' });
    }
});

// Update Product (Admin Only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete Product (Admin Only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;
