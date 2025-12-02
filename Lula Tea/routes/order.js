const express = require('express');
const router = express.Router();
const { orders } = require('../data/database');

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// Order confirmation
router.get('/confirmation/:orderId', requireAuth, (req, res) => {
    const order = orders.find(o => o.id === req.params.orderId && o.userId === req.session.user.id);
    
    if (!order) {
        return res.redirect('/user/orders');
    }
    
    res.render('order/confirmation', { 
        title: 'Order Confirmation - Lula Tea',
        order: order
    });
});

// Order tracking
router.get('/track/:orderId', (req, res) => {
    const order = orders.find(o => o.id === req.params.orderId);
    
    if (!order) {
        return res.render('order/track', { 
            title: 'Track Order - Lula Tea',
            order: null,
            error: 'Order not found'
        });
    }
    
    // Check if user owns this order or allow public tracking
    if (req.session.user && order.userId !== req.session.user.id) {
        // Allow tracking with just order ID for demo purposes
    }
    
    res.render('order/track', { 
        title: 'Track Order - Lula Tea',
        order: order,
        error: null
    });
});

// Track order by tracking number
router.get('/track', (req, res) => {
    res.render('order/track-search', { 
        title: 'Track Order - Lula Tea'
    });
});

router.post('/track', (req, res) => {
    const { trackingNumber } = req.body;
    const order = orders.find(o => o.trackingNumber === trackingNumber);
    
    if (!order) {
        return res.render('order/track', { 
            title: 'Track Order - Lula Tea',
            order: null,
            error: 'Order not found with this tracking number'
        });
    }
    
    res.render('order/track', { 
        title: 'Track Order - Lula Tea',
        order: order,
        error: null
    });
});

module.exports = router;
