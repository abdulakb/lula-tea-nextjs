const express = require('express');
const router = express.Router();
const { product } = require('../data/database');

// Home page
router.get('/', (req, res) => {
    res.render('home', { 
        title: 'Lula Tea - Premium Tea Blends',
        product: product
    });
});

// About page
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us - Lula Tea' });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us - Lula Tea' });
});

// Search
router.get('/search', (req, res) => {
    const query = req.query.q || '';
    const results = [];
    
    if (query.toLowerCase().includes('tea') || 
        query.toLowerCase().includes('premium') || 
        query.toLowerCase().includes('blend')) {
        results.push(product);
    }
    
    res.render('search', { 
        title: 'Search Results - Lula Tea',
        query: query,
        results: results
    });
});

module.exports = router;
