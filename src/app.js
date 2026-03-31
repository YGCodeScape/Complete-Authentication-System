// app.js
const express = require('express');
const morgan = require('morgan');
const authRouter = require('./routes/auth.routes');;

const app = express();

app.use(express.json());
app.use(morgan("dev"));

// pre pix for auth router API's
app.use("/api/auth", authRouter);

// Test route
app.get("/", (req, res) => {
    res.send("Server is live 🚀");
});

module.exports = app;