// server.js
require('dotenv').config();
const app = require('./src/app');

const { connectDB } = require('./config/config');

const PORT = process.env.PORT || 3000;

// Connect DB then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to start server:", err);
});