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
let howMuch;
let howPosts;

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

// the values of the email and password of the bot owner
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const user = {email: email, password: password}

// Set up middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// handles the the POST request of setting the bot's values
app.post('/update-values', (req, res) => {
    numDays = req.body.numDays;
    howMuch = req.body.howMuch;
    active = req.body.active;
    howPosts = req.body.howPosts;
    res.redirect('/bot');
});

// handles the POST request for the sign in
app.post('/signin', (req, res) => {
    const { email, password } = req.body; // get the email and the password we passed from the HTML script using fetch
    if (user.email === email && user.password === password) { // if the email and password are correct
        req.session.loggedIn = true; // the user is considered logged in
        req.session.save(err => { // save the session and redirect the user
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
    if (req.session.loggedIn) { // if the user is logged in
        res.sendFile(path.join(__dirname, 'public', 'login.html')); // pass them to the bot control page
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // otherwise send them to the login page
    }
});

app.get('/bot', async (req, res) => {
    if (req.session.loggedIn) { // if the user is logged in
        if (active) { // only start the bot when the user activates it
            try {
                await getQuotes(); // get the quotes and add them to the database
                await login(numDays, howPosts, howMuch); // login in the twitter account and start tweeting
                // based on the values passed from the post request
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send('An error occurred while processing your request.');
            }
        } else {
            res.sendFile(path.join(__dirname, 'public', 'login.html')); // send them to the control page
        }
    } else {
        res.redirect('/'); // if the user isn't logged in, pass them to the login page
    }
});

// the express js app is listening on this PORT
app.listen(PORT, () => {console.log(`Connection Successful on PORT ${PORT}`)})