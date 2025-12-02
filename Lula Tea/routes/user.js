const express = require('express');
const router = express.Router();
const { users, orders } = require('../data/database');

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
}

// Profile page
router.get('/profile', requireAuth, (req, res) => {
    const user = users.find(u => u.id === req.session.user.id);
    if (!user) {
        req.session.destroy();
        return res.redirect('/auth/login');
    }
    
    res.render('user/profile', { 
        title: 'My Profile - Lula Tea',
        user: user
    });
});

// Order history
router.get('/orders', requireAuth, (req, res) => {
    const userOrders = orders.filter(o => o.userId === req.session.user.id);
    
    res.render('user/orders', { 
        title: 'Order History - Lula Tea',
        orders: userOrders
    });
});

// Update profile
router.post('/profile/update', requireAuth, async (req, res) => {
    const { name, phone } = req.body;
    const user = users.find(u => u.id === req.session.user.id);
    
    if (user) {
        user.name = name || user.name;
        user.phone = phone || user.phone;
        req.session.user.name = user.name;
    }
    
    res.redirect('/user/profile');
});

// Add address
router.post('/address/add', requireAuth, (req, res) => {
    const { address } = req.body;
    const user = users.find(u => u.id === req.session.user.id);
    
    if (user && address) {
        if (!user.addresses) {
            user.addresses = [];
        }
        user.addresses.push({
            id: Date.now(),
            address: address,
            isDefault: user.addresses.length === 0
        });
    }
    
    res.redirect('/user/profile');
});

// Delete address
router.post('/address/delete', requireAuth, (req, res) => {
    const { addressId } = req.body;
    const user = users.find(u => u.id === req.session.user.id);
    
    if (user && user.addresses) {
        user.addresses = user.addresses.filter(a => a.id != addressId);
    }
    
    res.redirect('/user/profile');
});

module.exports = router;
