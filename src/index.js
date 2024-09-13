const PORT = process.env.PORT || 8080;

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const login = require('./login.js');
const getQuotes = require('./quotes.js');
const path = require('path');

let active = false;
let numDays;
let valueDays;

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // false for development, true for production
}))

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const user = {email: email, password: password}

// Set up middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.post('/update-values', (req, res) => {
    numDays = req.body.numDays;
    valueDays = req.body.valueDays;
    active = req.body.active;
    res.redirect('/bot');
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (user.email === email && user.password === password) {
        req.session.loggedIn = true;
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                res.status(500).send('An error occurred while processing your request.');
            } else {
                res.redirect('/bot');
            }
        });
    } else {
        res.send('Invalid Email or Password!');
        console.warn('Invalid Email')
    }
});

app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

app.get('/bot', async (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
        if (active) {
            try {
                await getQuotes();
                await login(numDays, valueDays);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send('An error occurred while processing your request.');
            }
        }
    } else {
        res.redirect('/');
    }
});

app.listen(PORT, () => {console.log(`Connection Successful on PORT ${PORT}`)})