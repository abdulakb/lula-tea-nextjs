const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { users, orders } = require('../data/database');
const { v4: uuidv4 } = require('uuid');

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// Checkout page
router.get('/', requireAuth, (req, res) => {
    const cart = req.session.cart || [];
    
    if (cart.length === 0) {
        return res.redirect('/cart');
    }
    
    const user = users.find(u => u.id === req.session.user.id);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 50; // Flat shipping rate in SAR
    const total = subtotal + shipping;
    
    res.render('checkout', { 
        title: 'Checkout - Lula Tea',
        cart: cart,
        user: user,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    });
});

// Process payment
router.post('/process', requireAuth, async (req, res) => {
    try {
        const { paymentMethod, shippingAddress } = req.body;
        const cart = req.session.cart || [];
        
        if (cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 50;
        const total = subtotal + shipping;
        
        let paymentStatus = 'pending';
        let paymentId = null;
        
        // Process payment based on method
        if (paymentMethod === 'stripe') {
            // In a real application, you would create a payment intent with Stripe
            // For demo purposes, we'll simulate a successful payment
            paymentId = 'demo_' + uuidv4();
            paymentStatus = 'paid';
            
            // Example Stripe integration (commented out for demo):
            /*
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(total * 100), // Convert to smallest currency unit
                currency: 'sar',
                payment_method: req.body.paymentMethodId,
                confirm: true,
                metadata: {
                    userId: req.session.user.id,
                    orderId: uuidv4()
                }
            });
            paymentId = paymentIntent.id;
            paymentStatus = 'paid';
            */
        } else if (paymentMethod === 'cod') {
            paymentStatus = 'cod';
            paymentId = 'cod_' + uuidv4();
        }
        
        // Create order
        const order = {
            id: uuidv4(),
            userId: req.session.user.id,
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
            paymentId: paymentId,
            paymentStatus: paymentStatus,
            orderStatus: 'processing',
            trackingNumber: 'LT' + Date.now(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        orders.push(order);
        
        // Add order to user
        const user = users.find(u => u.id === req.session.user.id);
        if (user) {
            if (!user.orders) user.orders = [];
            user.orders.push(order.id);
        }
        
        // Clear cart
        req.session.cart = [];
        
        res.json({ 
            success: true, 
            orderId: order.id,
            redirectUrl: `/order/confirmation/${order.id}`
        });
        
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Payment processing failed. Please try again.' 
        });
    }
});

module.exports = router;
