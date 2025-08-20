// server/index.js
require('dotenv').config();
// Read env variables from .env file

const express = require('express'); // EXPRESS is used to make the web server
const cors = require('cors'); // CORS allows web browsers to make requests to other domains

const app = express();
app.use(express.json());
// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL
}));

// Serve static files from public/uploads at /uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Simple Route
app.get("/", (req, res) => {
    res.send("Welcome to the learning space.");
});


// Routes
const reviewRoute = require('./routes/reviews');
app.use("/reviews", reviewRoute);
const userRoute = require('./routes/user');
app.use("/user", userRoute);
const fileRoute = require('./routes/file');
app.use("/file", fileRoute);
const copRoute = require('./routes/cop');
app.use("/cop", copRoute);
const chatRoute = require('./routes/chat');
app.use("/chat", chatRoute);

// AI Password route
const aiRoute = require('./routes/ai');
app.use('/ai', aiRoute);

// Password suggestion endpoint
const generatePassword = require('./utils/passwordGenerator');
app.get('/api/password-suggestion', (req, res) => {
    const password = generatePassword();
    res.json({ password });
});

const db = require('./models');
if (require.main === module) { // Only listen if running directly (not imported in test)
db.sequelize.sync({ alter: true }) // removed { alter: true } because it generated username_2 to username_63.
// After all, using `db.sequelize.sync({ alter: true })` in production is highly discouraged.
    .then(() => {
        let port = process.env.APP_PORT;
        app.listen(port, () => {
            console.log(`┌╮┌╴╭╮╭╮╭╮┌╮┌╴  ╭╮┌╴┌╮╷╷┌╴┌╮
││├ ╰╮│ ││││├   ╰╮├ │ ││├ │
└╯└╴╰╯╰╯╰╯└╯└╴  ╰╯└╴╵ └╯└╴╵
Server running on http://localhost:${port}`); // The ASCII says "DESCODE SERVER".
        });
    })
    .catch((err) => {
        console.log(err);
    });
}

module.exports = app; // export app only, no server instance