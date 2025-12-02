const express = require('express');
const router = express.Router();
const { product } = require('../data/database');

// View cart
router.get('/', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.render('cart', { 
        title: 'Shopping Cart - Lula Tea',
        cart: cart,
        total: total
    });
});

// Add to cart
router.post('/add', (req, res) => {
    const { productId, quantity } = req.body;
    
    if (!req.session.cart) {
        req.session.cart = [];
    }
    
    // Check if product already in cart
    const existingItem = req.session.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += parseInt(quantity) || 1;
    } else {
        req.session.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            image: product.images[0],
            quantity: parseInt(quantity) || 1
        });
    }
    
    res.json({ success: true, cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0) });
});

// Update cart item quantity
router.post('/update', (req, res) => {
    const { productId, quantity } = req.body;
    
    if (req.session.cart) {
        const item = req.session.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                req.session.cart = req.session.cart.filter(item => item.id !== productId);
            }
        }
    }
    
    const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.json({ success: true, total: total });
});

// Remove from cart
router.post('/remove', (req, res) => {
    const { productId } = req.body;
    
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id !== productId);
    }
    
    res.json({ success: true });
});

// Clear cart
router.post('/clear', (req, res) => {
    req.session.cart = [];
    res.json({ success: true });
});

module.exports = router;
