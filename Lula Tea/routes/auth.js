const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { users } = require('../data/database');

// Registration page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/user/profile');
    }
    res.render('auth/register', { title: 'Register - Lula Tea', error: null });
});

// Registration handler
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, address } = req.body;
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.render('auth/register', { 
                title: 'Register - Lula Tea', 
                error: 'All fields are required' 
            });
        }
        
        if (password !== confirmPassword) {
            return res.render('auth/register', { 
                title: 'Register - Lula Tea', 
                error: 'Passwords do not match' 
            });
        }
        
        if (password.length < 6) {
            return res.render('auth/register', { 
                title: 'Register - Lula Tea', 
                error: 'Password must be at least 6 characters' 
            });
        }
        
        // Check if user exists
        if (users.find(u => u.email === email)) {
            return res.render('auth/register', { 
                title: 'Register - Lula Tea', 
                error: 'Email already registered' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            addresses: address ? [{ id: Date.now(), address, isDefault: true }] : [],
            orders: [],
            createdAt: new Date()
        };
        
        users.push(user);
        
        // Log in the user
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        
        res.redirect('/user/profile');
    } catch (error) {
        console.error(error);
        res.render('auth/register', { 
            title: 'Register - Lula Tea', 
            error: 'An error occurred. Please try again.' 
        });
    }
});

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/user/profile');
    }
    res.render('auth/login', { title: 'Login - Lula Tea', error: null });
});

// Login handler
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.render('auth/login', { 
                title: 'Login - Lula Tea', 
                error: 'Email and password are required' 
            });
        }
        
        // Find user
        const user = users.find(u => u.email === email);
        
        if (!user) {
            return res.render('auth/login', { 
                title: 'Login - Lula Tea', 
                error: 'Invalid email or password' 
            });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.render('auth/login', { 
                title: 'Login - Lula Tea', 
                error: 'Invalid email or password' 
            });
        }
        
        // Log in the user
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        
        res.redirect('/user/profile');
    } catch (error) {
        console.error(error);
        res.render('auth/login', { 
            title: 'Login - Lula Tea', 
            error: 'An error occurred. Please try again.' 
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
