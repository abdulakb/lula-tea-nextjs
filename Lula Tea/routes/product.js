const express = require('express');
const router = express.Router();
const { product } = require('../data/database');

// Product detail page
router.get('/', (req, res) => {
    res.render('product', { 
        title: `${product.name} - Lula Tea`,
        product: product
    });
});

module.exports = router;
