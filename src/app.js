// app.js
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth.routes');

const app = express();

// middlaware's
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// pre pix for auth router API's
app.use("/api/auth", authRouter);

// Test route
app.get("/", (req, res) => {
    res.send("Server is live 🚀");
});

module.exports = app;