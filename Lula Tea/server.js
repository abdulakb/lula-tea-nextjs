const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'lula-tea-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make user and cart available to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.cart = req.session.cart || [];
    res.locals.cartCount = req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    next();
});

// Routes
const homeRoutes = require('./routes/home');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/order');

app.use('/', homeRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/order', orderRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error', 
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message 
    });
});

// Start server
if (process.env.SSL_ENABLED === 'true') {
    const https = require('https');
    const fs = require('fs');
    
    const options = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH)
    };
    
    https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
        console.log(`Lula Tea HTTPS Server running on https://localhost:${PORT}`);
        console.log(`Also accessible at https://192.168.100.176:${PORT}`);
    });
} else {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Lula Tea Server running on http://localhost:${PORT}`);
        console.log(`Also accessible at http://192.168.100.176:${PORT}`);
    });
}

module.exports = app;
